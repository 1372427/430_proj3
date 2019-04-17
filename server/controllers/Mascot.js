const models = require('../models');

const Account = models.Account;

// mascots by name and filename
const mascots = {
  Yuki: '1.png',
  Banyana: '2.png',
  Aoi: '3.png',
  Link: '4.png',
  Mizu: '5.png',
  Mahoutsukai: '6.png',
  Inu: '7.png',
  Neko: '8.png',
  Ren: '9.png',
  CSS: '10.png',
  Usagi: '11.png',
  Pisa: '12.png',
  Tanuki: '13.png',
  Ongaku: '14.png',
};

// send back all mascots
const getMascots = (req, res) => res.json({ mascots });

// assign account to certain mascot
const setMascot = (request, res) => {
  const req = request;
  const newMascot = req.body.mascot;
  // update account
  const updatePromise = Account.AccountModel.updateOne(
        { _id: req.session.account._id }, { mascot: req.body.mascot });
  // if update successful, change session information and refresh page
  updatePromise.then(() => {
    req.session.account.mascot = newMascot;
    res.json({ redirect: '/accountInfo' });
  });

  updatePromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Account already exists.' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return updatePromise;
};

module.exports.getMascots = getMascots;
module.exports.setMascot = setMascot;
module.exports.mascots = mascots;
