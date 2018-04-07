var express = require('express');
var router = express.Router();
var _ = require('underscore');

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
  req.models.user.findOne({ email: req.body.email, pass: req.body.pass }, { autoFetch: true }, (err, user) => {
    if (err) throw err;
    res.json({
      email: user.email,
      role: user.role
    });
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
