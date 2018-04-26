var express = require('express');
var router = express.Router();
var _ = require('underscore');
var async = require('async');

router.get('/all', (req, res) => {
	req.models.order.find({}, { autoFetch: true }, (err, orders) => {
		if (err) throw err;
		res.json(orders.map((order) => {
			var totalPrice = 0;
			var o = {};
			o.id = order.id;
			order.item = order.item.map((i) => {
				var j = {
					image: i.image,
					nameEn: i.nameEn,
					nameTh: i.nameTh,
					desc: i.desc,
					cat: i.cat,
					pricePerUnit: i.price,
					priceTimesN: i.price * i.extra.n,
					count: i.count,
					id: i.id,
					shop_id: i.shop_id,
					n: i.n,
					status: i.status
				};
				totalPrice += j.priceTimesN;
				return j;
			});
			o.itemsByShop = _.groupBy(order.item, i => i.shop_id);
			o.totalPrice = totalPrice;
			return o;
		}));
	});
});

router.get('/get/:id', (req, res) => {
	req.models.order.find({ id: req.params.id }, { autoFetch: true }, (err, orders) => {
		if (err) throw err;
		res.json(orders.map((order) => {
			var totalPrice = 0;
			var o = {};
			o.id = order.id;
			order.item = order.item.map((i) => {
				var j = {
					image: i.image,
					nameEn: i.nameEn,
					nameTh: i.nameTh,
					desc: i.desc,
					cat: i.cat,
					pricePerUnit: i.price,
					priceTimesN: i.price * i.extra.n,
					count: i.count,
					id: i.id,
					shop_id: i.shop_id,
					n: i.n,
					status: i.status
				};
				totalPrice += j.priceTimesN;
				return j;
			});
			o.itemsByShop = _.groupBy(order.item, i => i.shop_id);
			o.totalPrice = totalPrice;
			return o;
		}));
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
    order.getItem((err, items) => {
      if (err) throw err;
      var target = _.findIndex(items, i => i.id == req.params.item);
      items[target].extra.status = req.params.status;
      items[target].save((err) => {
        if (err) throw err;
        res.json({ success: true });
      });
    });
  });
});

router.get('/status/:order/:item', (req, res) => {
  req.models.order.get(req.params.order, (err, order) => {
    if (err) throw err;
    order.getItem((err, items) => {
      if (err) throw err;
      res.json({ status: _.find(items, i => i.id == req.params.item).extra.status });
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
