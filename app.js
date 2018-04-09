require('dotenv').config()

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var orm = require('orm');
var async = require('async');
var moment = require('moment');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(orm.express(process.env.JAWSDB_MARIA_URL, {
	define: function (db, models, next) {
		Item = db.define('item', {
			image: { type: 'text' },
			nameEn: { type: 'text' },
			nameTh: { type: 'text' },
			desc: { type: 'text' },
      cat: { type: 'text' },
			price: { type: 'integer' },
			size: { type: 'text' },
			count: { type: 'integer' }
		});

    Shop = db.define('shop', {
      name: { type: 'text' },
      logo: { type: 'text' },
      banner: { type: 'text' },
    });

    User = db.define('user', {
      email: { type: 'text', key: true },
      pass: { type: 'text' },
      role: { type: 'text' }
    });

    Item.hasOne('shop', Shop, { reverse: 'items' });

		models.item = Item;
    models.shop = Shop;
    models.user = User;

    console.log('Done defining models');
    // console.log('Start dropping tables');
    // db.drop(() => {
    //     console.log('Done dropping tables');
      console.log('Start syncing all models');
      db.sync(() => {
        console.log('Done syncing all models');
        next();
      });
    // });
	}
}));

app.use('/', index);
app.use('/api/item', require('./routes/item'));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/user', require('./routes/user'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
