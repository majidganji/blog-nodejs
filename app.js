var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');


var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');

var app = express();
require('./configs/admin-passport');
mongoose.connect('mongodb://localhost:27017/blog');

// view engine setup
app.engine('.hbs', exphbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat adas55asdasd45asd_asdad',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 180 * 60 *1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());

app.use('/', index);
app.use('/users', users);
app.use('/admin', admin);

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
  res.render('error', {layout: false});
});

module.exports = app;
