const models = require('../models');
const mascots = require('./Mascot.js');
const nodemailer = require('nodemailer');

const Contest = models.Competition;
const Entry = models.Entry;
const Account = models.Account;

// email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contest430mvc@gmail.com',
    pass: '3]jhT$tzWrV8&M?Y',
  },
});

// not being used as switched to react
const makeContestPage = (req, res) => {
  Contest.ContestModel.findById(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    return res.render('app', { csrfToken: req.csrfToken(), script:
      '/assets/makerBundle.js', entries: docs, mascot:
      `assets/img/mascots/${mascots.mascots[req.session.account.mascot]}` });
  });
};

// handle making a new contest
const makeContest = (req, res) => {
  // check all fields filled
  if (!req.body.descrip || !req.body.name || !req.body.reward || !req.body.deadline) {
    return res.status(400).json({ error: 'Fill out all fields!' });
  }
  let tags = [];
  if(req.body.tags){
    tags.trim();
    tags = req.body.tags.split(' ');
  }

  // set up information
  const contestData = {
    name: req.body.name,
    owner: req.session.account._id,
    description: req.body.descrip,
    reward: req.body.reward,
    deadline: req.body.deadline,
    mascot: mascots.mascots[req.session.account.mascot],
    tags: tags
  };
  // create new contest
  const newContest = new Contest.ContestModel(contestData);

  // save contest
  const contestPromise = newContest.save();

  // if save successful, redirect to home page
  contestPromise.then(() => res.json({ redirect: '/home' }));

  contestPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Contest already exists.' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return contestPromise;
};

// get all cntests made by given owner
const getContestsByOwner = (request, response) => {
  const req = request;
  const res = response;

  // query database for contests by current account
  return Contest.ContestModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    return res.json({ contests: docs });
  });
};

// get all contests with a deadline in the future
const getContestsByDate = (request, response) => {
  const res = response;

  // query database for all contests with a deadline greater or equal to today
  return Contest.ContestModel.findByDeadline(Date.now(), (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ contests: docs });
  });
};

// determine if need to get contests by owner or by date
// by checking if an owner is queried
const getContest = (req, res) => {
  if (req.query.owner) {
    getContestsByOwner(req, res);
  } else {
    getContestsByDate(req, res);
  }
  return;
};

const getTags = (request, response) => {
  let res = response;
  return Contest.ContestModel.getTags().then((d) =>  res.json({tags: d}));
}

// set the winner to a contest and email the winner
const setWin = (request, response) => {
  const res = response;
  const req = request;

  // find the given entry
  return Entry.EntryModel.findById(req.body.entry, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'Entry does not exist' });
    }

    // find the contest and update winner
    const upgradePromise = Contest.ContestModel.updateOne(
      { _id: req.body.contest }, { winner: docs[0].owner });

    upgradePromise.then(() => Account.AccountModel.findById(docs[0].owner, (err3, winner) => {
      if (err3) {
        console.log(err3);
        return res.status(400).json({ error: 'User does not exist' });
      }

      // if update is successful, find the account owner of the entry
      return Account.AccountModel.findById(req.session.account._id, (err4, contestOwner) => {
        if (err4) {
          console.log(err4);
          return res.status(400).json({ error: 'User does not exist' });
        }
        // configure email
        const mailOptions = {
          from: 'contest430mvc@gmail.com',
          to: winner.email,
          subject: 'Congratulations!',
          html: `Congrats ${winner.username}! You won a contest! 
          Please contact ${contestOwner.username} at 
          ${contestOwner.email} to recieve your prize!`,
        };

        // send email
        return transporter.sendMail(mailOptions, (error5) => {
          if (error5) console.log(error5);
          return res.status(200).json({ winner:
            { username: winner.username, email: winner.email } });
        });
      });
    }));

    upgradePromise.catch((err2) => {
      console.log(err2);
      if (err2.code === 11000) {
        return res.status(400).json({ error: 'Contest already exists.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });

    return upgradePromise;
  });
};

module.exports.makePage = makeContestPage;
module.exports.make = makeContest;
module.exports.getContestsByOwner = getContestsByOwner;
module.exports.getContestsByDate = getContestsByDate;
module.exports.setWin = setWin;
module.exports.getContests = getContest;
module.exports.getTags = getTags;
