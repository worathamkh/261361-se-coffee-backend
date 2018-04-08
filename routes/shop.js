var express = require('express');
var router = express.Router();
var _ = require('underscore');

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
		image: req.body.image,
		nameEn: req.body.nameEn,
		nameTh: req.body.nameTh,
		desc: req.body.desc,
		price: req.body.price,
		size: req.body.size,
		count: req.body.count
	}, (err, shop) => {
		if (err) throw err;
		res.json({ success: true });
	});
});

// router.post('/gen', (req, res) => {
//     randomName(1).then((name) => {
//         req.models.login.create({
//             email: changeCase.camelCase(name) + '@gmail.com',
//             password: '123',
//             name: changeCase.titleCase(name),
//         }, (err, login) => {
//             if (err) throw err;
//             login.setHost(new Host({}), (err) => {
//                 if (err) throw err;
//                 res.json({ success: true });
//             });
//         });
//     });
// });
//

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
