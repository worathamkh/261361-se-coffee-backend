var express = require('express');
var router = express.Router();
var _ = require('underscore');
var async = require('async');

router.get('/all', (req, res) => {
	req.models.order.find({}, { autoFetch: true }, (err, orders) => {
		if (err) throw err;
		res.json(orders);
	});
});

router.get('/get/:id', (req, res) => {
	req.models.order.find({ id: req.params.id }, { autoFetch: true }, (err, order) => {
		if (err) throw err;
		res.json(order);
	});
});

router.post('/create', (req, res) => {
	req.models.order.create({
	}, (err, order) => {
		if (err) throw err;
    // add items
    // map {item, n, status} to functions
    // use async.parallel
    async.parallel(req.body.items.map(i => ((cb) => {
      req.models.item.get(i.item, (err, item) => {
        if (err) cb(err);
        else order.addItem(item, { n: i.n, status: i.status }, (err) => {
          if (err) cb(err);
          else cb(null, 1);
        });
      });
    })), (err, results) => {
      if (err) throw err;
      res.json({ success: true });
    });
	});
});

router.post('/status/:order/:item/:status', (req, res) => {
  req.models.order.get(req.params.order, (err, order) => {
    if (err) throw err;
    var target = _.findIndex(order.item, i => i.id === req.params.item);
    order.item[target].status = req.params.status;
    order.item[target].extra.status = req.params.status;
    order.save((err) => {
      if (err) throw err;
      res.json({ success: true });
    });
  });
});

router.get('/clear', (req, res) => {
  if (req.query.magicword !== '123') {
    res.json({ success: false });
  } else {
    req.models.order.find({}).remove((err) => {
      if (err) throw err;
      res.json({ success: true });
    });
  }
});

router.get('/resync', (req, res) => {
  if (req.query.magicword !== '123') {
    res.json({ success: false });
  } else {
    req.models.order.drop((err) => {
      if (err) throw err;
      req.models.order.sync((err) => {
        if (err) throw err;
        res.json({ success: true });
      });
    });
  }
});

module.exports = router;
