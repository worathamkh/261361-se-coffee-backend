var express = require('express');
var router = express.Router();
var _ = require('underscore');
var util = require('util');
var async = require('async');

router.get('/all', (req, res) => {
	req.models.shop.find({}, {}, (err, shops) => {
		if (err) throw err;
		req.models.item.find({}, {}, (err, items) => {
			if (err) throw err;
			async.map(items, (item, cb) => {
				item.getOrders((err, orders) => {
					if (err) cb(err);
					else {
						item.orders = orders;
						item.deliveredCount = _.reduce(orders, (D, o) => D + (o.status == 'delivered' ? o.n : 0), 0);
						item.soldCount = _.reduce(orders, (N, o) => N + o.n, 0);
						item.soldMoney = item.price * item.soldCount;
						cb(null, item);
					}
				});
			}, (err, results) => {
				if (err) throw err;
				itemsByShop = _.groupBy(results, i => i.shop_id);
				res.json(_.map(shops, (shop) => {
					shop.items = itemsByShop[shop.id.toString()] || [];
					// shop.totalIncome = _.reduce(itemsByShop, (X, I) => X + _.reduce(I, (x, i) => x + i.soldMoney, 0), 0);
					shop.totalIncome = _.reduce(shop.items, (x, i) => x + i.soldMoney, 0);
					shop.totalOrdered = _.reduce(shop.items, (n, i) => n + i.soldCount, 0);
					shop.totalDelivered = _.reduce(shop.items, (d, i) => d + i.deliveredCount, 0);
					shop.percentageDelivered = shop.totalOrdered > 0 ? shop.totalDelivered / shop.totalOrdered * 100 : 0;
					return shop;
				}));
			});
		});
	});
});

router.get('/get/:id', (req, res) => {
	req.models.shop.find({ id: req.params.id }, {}, (err, shops) => {
		if (err) throw err;
		req.models.item.find({}, {}, (err, items) => {
			if (err) throw err;
			async.map(items, (item, cb) => {
				item.getOrders((err, orders) => {
					if (err) cb(err);
					else {
						item.orders = orders;
						item.soldCount = _.reduce(orders, (N, o) => N + o.n, 0);
						item.soldMoney = item.price * item.soldCount;
						cb(null, item);
					}
				});
			}, (err, results) => {
				if (err) throw err;
				itemsByShop = _.groupBy(results, i => i.shop_id);
				res.json(_.map(shops, (shop) => {
					shop.items = itemsByShop[shop.id.toString()] || [];
					shop.totalIncome = _.reduce(itemsByShop, (X, I) => X + _.reduce(I, (x, i) => x + i.soldMoney, 0), 0);
					return shop;
				}));
			});
		});
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
	req.models.shop.get(req.params.id, (err, shop) => {
		if (err) throw err;
		shop.approved = true;
		shop.save((err) => {
			if (err) throw err;
			res.json({ success: true });
		});
	});
});

router.post('/disapprove/:id', (req, res) => {
	req.models.shop.get(req.params.id, (err, shop) => {
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
