const controllers = require('./controllers');
const mid = require('./middleware');

// set up all get and post requests
// anything not defined routes to not found page
const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getContests', mid.requiresLogin, mid.requiresValidated,
  controllers.Competition.getContests);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/upgrade', mid.requiresLogin, mid.requiresValidated, controllers.Account.upgrade);
  app.post('/pass', mid.requiresLogin, mid.requiresValidated, controllers.Account.passChange);
  app.post('/email', mid.requiresLogin, mid.requiresValidated, controllers.Account.emailChange);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/home', mid.requiresLogin, mid.requiresValidated, controllers.Entry.makePage);
  app.get('/accountInfo', mid.requiresLogin, mid.requiresValidated,
  controllers.Account.accountPage);
  app.get('/mascots', mid.requiresLogin, mid.requiresValidated, controllers.Mascot.getMascots);
  app.post('/mascots', mid.requiresLogin, mid.requiresValidated, controllers.Mascot.setMascot);
  app.get('/makeContest', mid.requiresLogin, mid.requiresValidated,
  controllers.Competition.makePage);
  app.post('/makeEntry', mid.requiresLogin, mid.requiresValidated, controllers.Entry.make);
  app.get('/entries', mid.requiresLogin, mid.requiresValidated,
  controllers.Entry.getEntriesByContest);
  app.post('/makeContest', mid.requiresLogin, mid.requiresValidated, controllers.Competition.make);
  app.get('/tags', mid.requiresLogin, mid.requiresValidated, controllers.Competition.getTags);
  app.get('/validate', controllers.Account.validate);
  app.get('/unlock', controllers.Account.unlock);
  app.get('/exceed', controllers.Account.getTooManyAttempts);
  app.get('/resetPass', controllers.Account.getReset);
  app.post('/setWinner', mid.requiresLogin, mid.requiresValidated, controllers.Competition.setWin);
  app.get('/notValid', mid.requiresSecure, mid.requiresNotValidated, controllers.Account.notValid);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('*', controllers.NotFound.notfoundPage);
};

module.exports = router;
