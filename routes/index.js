var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
    req.app.locals.layout = 'layout';
    next();
});

router.get('/', function(req, res, next) {
  res.render('index/index', { title: 'Movie'});
});

module.exports = router;
