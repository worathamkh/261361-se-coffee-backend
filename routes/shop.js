var express = require('express');
var router = express.Router();
var _ = require('underscore');
var utils = require('utils');

router.get('/all', (req, res) => {
	req.models.shop.find({}, { autoFetch: true }, (err, shops) => {
		if (err) throw err;
		res.json(shops);
	});
});

router.get('/get/:id', (req, res) => {
	req.models.shop.find({ id: req.params.id }, { autoFetch: true }, (err, shop) => {
		if (err) throw err;
		res.json(shop);
	});
});

router.get('/top/:n', (req, res) => {
	req.models.shop.find({}, { autoFetch: true }, (err, shops) => {
		if (err) throw err;
		res.json(_.shuffle(shops).slice(0, req.params.n));
	});
});

router.post('/create', (req, res) => {
	req.models.shop.create({
		name: req.body.name,
		logo: req.body.logo,
		banner: req.body.banner
	}, (err, shop) => {
		if (err) throw err;
		res.json({ success: true });
	});
});

router.post('/approve/:id', (req, res) => {
	req.models.shop.find({ id: req.params.id }, (err, shop) => {
		if (err) throw err;
		console.log(utils.inspect(shop));
		shop.save({ approved: true }, (err) => {
			if (err) throw err;
			res.json({ success: true });
		});
	});
});

router.post('/disapprove/:id', (req, res) => {
	req.models.shop.find({ id: req.params.id }, (err, shop) => {
		if (err) throw err;
		shop.approved = false;
		shop.save((err) => {
			if (err) throw err;
			res.json({ success: true });
		});
	});
});

router.post('/remove/:id', (req, res) => {
	req.models.shop.find({ id: req.params.id }).remove((err) => {
		if (err) throw err;
		res.json({ success: true });
	})
});

router.get('/clear', (req, res) => {
  if (req.query.magicword !== '123') {
    res.json({ success: false });
  } else {
    req.models.shop.find({}).remove((err) => {
      if (err) throw err;
      res.json({ success: true });
    });
  }
});

router.get('/resync', (req, res) => {
  if (req.query.magicword !== '123') {
    res.json({ success: false });
  } else {
    req.models.shop.drop((err) => {
      if (err) throw err;
      req.models.shop.sync((err) => {
        if (err) throw err;
        res.json({ success: true });
      });
    });
  }
});

module.exports = router;
