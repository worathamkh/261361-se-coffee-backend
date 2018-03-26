var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
	req.models.item.find({}, { autoFetch: true }, (err, items) => {
		if (err) throw err;
		res.json(items);
	});
});

router.get('/:id', (req, res) => {
	req.models.item.find({}, { autoFetch: true }, (err, item) => {
		if (err) throw err;
		res.json(item);
	});
});

router.post('/new', (req, res) => {
	req.models.item.create({
		image: req.body.image,
		nameEn: req.body.nameEn,
		nameTh: req.body.nameTh,
		desc: req.body.desc,
		price: req.body.price,
		size: req.body.size
	}, (err, item) => {
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
