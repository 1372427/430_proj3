const mascots = require('./Mascot.js');

const notfoundPage = (req, res) => {
  let mascot = '10.png';
  if (req.session.account)mascot = mascots.mascots[req.session.account.mascot];
  return res.render('notFound', { mascot:
        `assets/img/mascots/${mascot}` });
};

module.exports.notfoundPage = notfoundPage;
