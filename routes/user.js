var express = require('express');
var router = express.Router();

router.get('/all', (req, res) => {
  req.models.user.find({}, { autoFetch: true }, (err, users) => {
    if (err) throw err;
    res.json(users);
  });
});
router.post('/register', (req, res) => {
  req.models.user.create({
    email: req.body.email,
    pass: req.body.pass,
    role: req.body.role
  }, (err, user) => {
    if (err) throw err;
    res.json({ success: true });
  });
});

router.post('/login', (req, res) => {
  req.models.user.find({ email: req.body.email, pass: req.body.pass }, { autoFetch: true }, (err, users) => {
    if (err) throw err;
    if (Array.isArray(users) && users[0]) {
      res.json({
        email: users[0].email,
        role: users[0].role
      }).status(200);
    } else {
      res.json({ success: false }).status(401);
    }
  });
});

router.get('/clear', (req, res) => {
  if (req.query.magicword !== '123') {
    res.json({ success: false });
  } else {
    req.models.user.find({}).remove((err) => {
      if (err) throw err;
      res.json({ success: true });
    });
  }
});

router.get('/resync', (req, res) => {
  if (req.query.magicword !== '123') {
    res.json({ success: false });
  } else {
    req.models.user.drop((err) => {
      if (err) throw err;
      req.models.user.sync((err) => {
        if (err) throw err;
        res.json({ success: true });
      });
    });
  }
});

module.exports = router;
