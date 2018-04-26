var express = require('express');
var router = express.Router();
var _ = require('underscore');
var orm = require('orm');

router.get('/all', (req, res) => {
	req.models.item.find({}, { autoFetch: true }, (err, items) => {
		if (err) throw err;
		res.json(items);
	});
});

router.get('/get/:id', (req, res) => {
	req.models.item.find({ id: req.params.id }, { autoFetch: true }, (err, item) => {
		if (err) throw err;
		res.json(item);
	});
});

router.get('/findByCat/:cat/:shop', (req, res) => {
	req.models.item.find({ cat: orm.like(req.params.cat), shop_id: req.params.shop }, { autoFetch: true }, (err, item) => {
		if (err) throw err;
		res.json(item);
	});
});

// router.get('/findByCat/:cat', (req, res) => {
//   req.models.item.find({ cat: orm.like(req.params.cat) }, { autoFetch: true }, (err, item) => {
//     if (err) throw err;
//     res.json(item);
//   });
// });

router.get('/top/:n', (req, res) => {
	req.models.item.find({}, { autoFetch: true }, (err, items) => {
		if (err) throw err;
		res.json(_.shuffle(items).slice(0, req.params.n));
	});
});

router.get('/topCoffee/:n', (req, res) => {
	req.models.item.find({ cat: orm.like('coffee bean') }, { autoFetch: true }, (err, items) => {
		if (err) throw err;
		res.json(_.shuffle(items).slice(0, req.params.n));
	});
});

router.get('/topOthers/:n', (req, res) => {
	req.models.item.find({ cat: orm.not_like('coffee bean') }, { autoFetch: true }, (err, items) => {
		if (err) throw err;
		res.json(_.shuffle(items).slice(0, req.params.n));
	});
});

router.get('/cat', (req, res) => {
	req.models.item.find({}, { autoFetch: true }, (err, items) => {
		if (err) throw err;
		res.json(_.uniq(items.map(i => i.cat)));
	});
});

router.post('/create', (req, res) => {
	req.models.item.create({
		image: req.body.image,
		nameEn: req.body.nameEn,
		nameTh: req.body.nameTh,
		desc: req.body.desc,
		cat: req.body.cat,
		price: req.body.price,
		size: req.body.size,
		count: req.body.count,
		shop_id: req.body.shop_id
	}, (err, item) => {
		if (err) throw err;
		res.json({ success: true });
	});
});

router.get('/clear', (req, res) => {
  if (req.query.magicword !== '123') {
    res.json({ success: false });
  } else {
    req.models.item.find({}).remove((err) => {
      if (err) throw err;
      res.json({ success: true });
    });
  }
});

router.get('/resync', (req, res) => {
  if (req.query.magicword !== '123') {
    res.json({ success: false });
  } else {
    req.models.item.drop((err) => {
      if (err) throw err;
      req.models.item.sync((err) => {
        if (err) throw err;
        res.json({ success: true });
      });
    });
  }
});

module.exports = router;
