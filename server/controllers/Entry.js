const models = require('../models');
const mascots = require('./Mascot.js');

const Entry = models.Entry;
const Contest = models.Competition;
const Account = models.Account;

// not used since moved to react
const makeEntryPage = (req, res) => {
  if (req.query.accountInfo) {
    Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occured' });
      }
      const accountInfo = {
        username: docs.username,
        email: docs.email,
        type: docs.type,
      };
      return res.render('app', { csrfToken: req.csrfToken(), script:
        'assets/makerBundle.js', account: accountInfo, mascot:
        `assets/img/mascots/${mascots.mascots[req.session.account.mascot]}` });
    });
  } else {
    Contest.ContestModel.findByDeadline(Date.now(), (err, docs) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occured' });
      }
      return res.render('app', { csrfToken: req.csrfToken(), script:
        'assets/homeBundle.js', entries: docs, mascot:
        `assets/img/mascots/${mascots.mascots[req.session.account.mascot]}` });
    });
  }
};

// handle making a new entry
const makeEntry = (req, res) => {
  // check all fields filled
  if (!req.body.content || !req.body.name) {
    return res.status(400).json({ error: 'Fill out entry please' });
  }

  // set up information
  const entryData = {
    content: req.body.content,
    contest: req.body.contest,
    name: req.body.name,
    owner: req.session.account._id,
    mascot: mascots.mascots[req.session.account.mascot],
  };
  // find contest to assign entry to
  return Contest.ContestModel.findById(req.body.contest, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    if (docs.length < 1) return res.status(400).json({ error: 'Contest does not exist' });

    // contest exists! create new entry
    const newEntry = new Entry.EntryModel(entryData);

    // save entry
    const entryPromise = newEntry.save();

    // if save is successful, update contest
    entryPromise.then(() => {
      // update contest's number of entries
      const upgradePromise = Contest.ContestModel.updateOne(
        { _id: req.body.contest }, { entries: docs[0].entries + 1 });

        // redirect to home page
      upgradePromise.then(() => res.json({ redirect: '/home' }));
      upgradePromise.catch((err2) => {
        console.log(err2);
        return res.status(400).json({ error: 'An error occurred' });
      });
    });

    entryPromise.catch((err2) => {
      console.log(err2);
      if (err2.code === 11000) {
        return res.status(400).json({ error: 'Entry already exists.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });

    return entryPromise;
  });
};

// get all entries by account
const getEntriesByOwner = (request, response) => {
  const req = request;
  const res = response;

  return Entry.EntryModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ entries: docs });
  });
};

// get all entries by contest
const getEntriesByContest = (request, response) => {
  const req = request;
  const res = response;
  return Entry.EntryModel.findByContest(req.query.contest, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ entries: docs });
  });
};


module.exports.makePage = makeEntryPage;
module.exports.make = makeEntry;
module.exports.getEntriesByOwner = getEntriesByOwner;
module.exports.getEntriesByContest = getEntriesByContest;
