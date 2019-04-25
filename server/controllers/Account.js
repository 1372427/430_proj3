const models = require('../models');
const nodemailer = require('nodemailer');

const Account = models.Account;

const baseUrl = (process.env.NODE_ENV === 'production' ? 'https://project3-react.herokuapp.com/' : 'http://localhost:3000/');

// set up information to send emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'contest430mvc@gmail.com',
    pass: '3]jhT$tzWrV8&M?Y',
  },
});

// render the login page template
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// query DB for account information
const accountPage = (req, res) => {
  Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }

    // only send back relevant information
    const accountInfo = {
      username: docs.username,
      email: docs.email,
      type: docs.type,
      mascot: docs.mascot,
      id: docs._id,
    };
    return res.json({ account: accountInfo });
  });
};

// handles change from basic to premium account and sends an email
const upgrade = (req, res) => {
  // find the current signed in user
  Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    // get account information
    const accountInfo = {
      username: docs.username,
      email: docs.email,
      type: docs.type,
    };

    // upgrade account
    const upgradePromise = Account.AccountModel.updateOne(
      { username: accountInfo.username }, { type: 'Premium' });

    // if successful, send an email
    upgradePromise.then(() => {
      // set up email
      const mailOptions = {
        from: 'contest430mvc@gmail.com',
        to: accountInfo.email,
        subject: 'Account Creation Confirmation',
        html: `Thank you ${accountInfo.username}. You updated your account with Contest.
         You can now create contests.`,
      };

      // send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log(`email sent: ${info.response}`);
      });

      // refresh page
      res.json({ redirect: '/accountInfo' });
    });

    upgradePromise.catch((err2) => {
      console.log(err2);
      if (err2.code === 11000) {
        return res.status(400).json({ error: 'Account already exists.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });

    return upgradePromise;
  });
};

// handle account email change
const emailChange = (req, res) => {
  // check if there is an email to change to
  if (!req.body.email) return res.status(400).json({ error: 'Please put a new email!' });
  // find this account
  return Account.AccountModel.findByUsername(req.session.account.username, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }
    // get relevant account information
    const accountInfo = {
      username: docs.username,
      email: docs.email,
      type: docs.type,
    };

    // update account
    const upgradePromise = Account.AccountModel.updateOne(
      { username: accountInfo.username }, { email: req.body.email });

    // if update is successful, send an email
    upgradePromise.then(() => {
      // set up email to new email address
      const mailOptions = {
        from: 'contest430mvc@gmail.com',
        to: req.body.email,
        subject: 'Account Information Change Confirmation',
        html: `Hello ${accountInfo.username}. You updated your account with Contest.
         Your new email is ${req.body.email}.`,
      };

      // send email
      transporter.sendMail(mailOptions, (error) => {
        if (error) console.log(error);
      });
      // set up email for old address and send
      mailOptions.to = accountInfo.email;
      transporter.sendMail(mailOptions, (error) => {
        if (error) console.log(error);
      });
      // refresh account page
      res.json({ redirect: '/accountInfo' });
    });

    upgradePromise.catch((err2) => {
      console.log(err2);
      if (err2.code === 11000) {
        return res.status(400).json({ error: 'Account already exists.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });

    return upgradePromise;
  });
};

// handle password change
const passChange = (req, res) => {
  const username = req.body.username || req.session.account.username;
  // check if there is a new password
  if (!req.body.pass) return res.status(400).json({ error: 'Please put a new password!' });
  // find account
  return Account.AccountModel.findByUsername(username, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    // get relevant account information
    const accountInfo = {
      pass: docs.password,
      email: docs.email,
      type: docs.type,
    };

    // rehash the password and update
    return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
      const upgradePromise = Account.AccountModel.updateOne(
      { username }, { password: hash, salt });

      // if update is successful, send email
      upgradePromise.then(() => {
        // set up email
        const mailOptions = {
          from: 'contest430mvc@gmail.com',
          to: accountInfo.email,
          subject: 'Account Information Change Confirmation',
          html: `Hello ${accountInfo.username}. You updated your account with Contest.
         Your new password is ${req.body.pass}.`,
        };

        // send email
        transporter.sendMail(mailOptions, (error) => {
          if (error) console.log(error);
        });

        res.json({ redirect: '/accountInfo' });
      });

      upgradePromise.catch((err2) => {
        console.log(err2);
        if (err2.code === 11000) {
          return res.status(400).json({ error: 'Account already exists.' });
        }

        return res.status(400).json({ error: 'An error occurred' });
      });

      return upgradePromise;
    });
  });
};

// handle user logout
const logout = (req, res) => {
  // get rid of this session information
  req.session.destroy();
  // send to home page
  res.redirect('/');
};

// handle user login
const login = (request, response) => {
  const req = request;
  const res = response;

    // force cast to strings to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  // check all fields exist
  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // check if passowrd is correct
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      // if wrong password
      if (err && err.username) {
        // update account for number of wrong sign in attempts
        return Account.AccountModel.updateOne({ _id: err._id },
          { signInAttempts: err.signInAttempts + 1 }).then(() => {
            // if the number of sign in attempts is greater than 4, send to
            // an exceeded page
            if (err.signInAttempts >= 4) {
              // when sign in attempts is equal to four, send an email informing
              // user their account has been locked
              if (err.signInAttempts === 4) {
               // send confirmation email
                const mailOptions = {
                  from: 'contest430mvc@gmail.com',
                  to: err.email,
                  subject: 'Too Many Attempts',
                  html: `<p>Dear ${err.username},</p>
                <p>There have been too many log in attempts with your username. 
                Your account has been locked for your security.</p>
                <p>Please click the link to unlock your account and reset your password. </p>
                <a href="${baseUrl}unlock?username=${err.username}">
                Click me to unlock your account!</a>
                `,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) console.log(error);
                  else console.log(`email sent: ${info.response}`);
                });
              }
              return res.json({ redirect: '/exceed' });
            }
            return res.status(401).json({ error: 'Wrong password' });
          }
        );
      }
      return res.status(401).json({ error: 'Wrong login info' });
    }

    // if correct password, but account is locked, send to the locked page
    if (account.signInAttempts >= 5) {
      return res.json({ redirect: '/exceed' });
    }

    // set up session if accout is correct
    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/home' });
  });
};

// handle signup
const signup = (request, response) => {
  const req = request;
  const res = response;

    // cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;
  req.body.email = `${req.body.email}`;

  // check all fields exist
  if (!req.body.username || !req.body.pass || !req.body.pass2 || !req.body.email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // check passwords match
  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // make hash with the password
  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
      email: req.body.email,
      type: 'Basic',
    };

    // create new account
    const newAccount = new Account.AccountModel(accountData);

    // save account
    const savePromise = newAccount.save();

    // if save is successful
    savePromise.then(() => {
      // update session
      req.session.account = Account.AccountModel.toAPI(newAccount);

      // send confirmation email
      const mailOptions = {
        from: 'contest430mvc@gmail.com',
        to: accountData.email,
        subject: 'Account Creation Confirmation',
        html: `<p>Dear ${accountData.username},</p>
        <p>Thank you for creating an account with Contest.</p>
        <p>Please click the link to validate your account. </p>
        <a href="${baseUrl}validate?username=${accountData.username}">
        Click me to validate your account!</a>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log(`email sent: ${info.response}`);
      });

      return res.json({ redirect: '/home' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });
  });
};

// when user clicks on validation link, update account and send to home page
const validate = (req, res) => {
  Account.AccountModel.updateOne(
    { username: req.query.username }, { validated: true }
  ).then(() => res.redirect('/home'));
};

// if account isn't validated, show message
const notValid = (req, res) => res.render('notify', { message: [
  'An email has been sent.',
  'Please validate your account!'], mascot:
   'assets/img/mascots/9.png' });

// if account is locked, show message
const getTooManyAttempts = (req, res) => res.render('notify',
  { message: ['Too many login attempts!',
    'Please check your email to unlock your account.'],
    mascot: 'assets/img/mascots/9.png' });

// when user clicks on unlock link, send them to reset their password
const unlock = (req, request) => {
  const res = request;
  Account.AccountModel.updateOne(
    { username: req.query.username }, { signInAttempts: 0 }
  ).then(() => res.redirect(`/resetPass/${req.query.username}`));
};

// render the reset form page
const getReset = (req, res) => res.render('reset');

// confirm username and email match, then send a link to email to reset
// their password
const getResetSendEmail = (req, res) => {
  // check all fields filled
  if (!req.body.email || !req.body.username) {
    return res.status(400).json({ error: 'Fill out form!' });
  }
  // check username and email are correct
  return Account.AccountModel.findByUsername(req.body.username, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occured' });
    }
    if (!docs) {
      return res.status(400).json({ error: "Username doesn't exist" });
    }

    // only send back relevant information
    const accountData = {
      username: docs.username,
      email: docs.email,
      type: docs.type,
      mascot: docs.mascot,
      id: docs._id,
    };

    if (accountData.email === req.body.email) {
      // send email
      const mailOptions = {
        from: 'contest430mvc@gmail.com',
        to: accountData.email,
        subject: 'Reset Password Request',
        html: `<p>Dear ${accountData.username},</p>
        <p>A request has been made to reset your account password.</p>
        <p>Please click the link to reset your password. </p>
        <p>If you did not make this request, please ignore this message. </p>
        <a href="${baseUrl}resetPage?username=${accountData.username}">
        Click me to reset your password!</a>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log(`email sent: ${info.response}`);
      });

      // redirect to notify page
      return res.json({ redirect: '/resetSent' });
    }
    return res.status(400).json({ error: 'Incorrect Email' });
  });
};

// when an email has been sent to reset the password, show message
const resetSent = (req, res) => res.render('notify', { message: ['An email has been sent',
  'Check your email to reset your password'],
  mascot: 'assets/img/mascots/9.png' });


const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };
  res.json(csrfJSON);
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.upgrade = upgrade;
module.exports.signup = signup;
module.exports.getToken = getToken;
module.exports.accountPage = accountPage;
module.exports.passChange = passChange;
module.exports.emailChange = emailChange;
module.exports.validate = validate;
module.exports.notValid = notValid;
module.exports.getTooManyAttempts = getTooManyAttempts;
module.exports.unlock = unlock;
module.exports.getReset = getReset;
module.exports.getResetSendEmail = getResetSendEmail;
module.exports.resetSent = resetSent;
module.exports.resetPass = passChange;
