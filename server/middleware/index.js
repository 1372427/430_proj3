const Account = require('../models/Account.js');

const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/');
  }
  return next();
};

const requiresValidated = (req, res, next) => {
  Account.AccountModel.findById(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    if(docs.validated) return next();
    return res.redirect('/notValid');
  });
};

const requiresNotValidated = (req, res, next) => {
  Account.AccountModel.findById(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    if(docs.validated) return res.redirect('/home');
    return next();
  });
};

const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/home');
  }
  return next();
};

const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

const bypassSecure = (req, res, next) => {
  next();
};

module.exports.requiresLogin = requiresLogin;
module.exports.requiresLogout = requiresLogout;
module.exports.requiresValidated = requiresValidated;
module.exports.requiresNotValidated = requiresNotValidated;

if (process.env.NODE_ENV === 'production') {
  module.exports.requiresSecure = requiresSecure;
} else {
  module.exports.requiresSecure = bypassSecure;
}
