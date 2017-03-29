var express = require('express');
var csrf = require('csurf');
var Admin = require('../models/admin');
var passport = require('../configs/admin-passport');

var router = express.Router();
var csrfProtection = csrf({ cookie: true });

router.use(function (req, res, next) {
    req.app.locals.layout = 'admin';
    if (req.url !== '/logout' && req.isAuthenticated()){
        res.redirect('/dashbord/index');
        return;
    }
    next();
});

router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use(csrfProtection);

router.get('/login', function (req, res, next) {
    var messages = req.flash('error');
    res.render('admin/login', {csrfToken: req.csrfToken(), messages: messages, hasError: messages.length > 0});
});

router.post('/login', passport.authenticate('local.login', {
    successRedirect: '/dashbord/index',
    failureRedirect: '/admin/login',
    failureFlash: true
}));

router.get('/signup', function (req, res, next) {
    res.render('admin/signup', {csrfToken: req.csrfToken()});
});

router.post('/signup', function (req, res, next) {
    req.checkBody('name').notEmpty().withMessage('نام نمی تواند خالی باشد.');
    req.checkBody('username').notEmpty().withMessage('نام کاربری نمی تواند خالی باشد.').isLength({min: 3}).withMessage('نام کاربری باید بیشتر از 3 کاراکتر باشد.');
    req.checkBody('email').notEmpty().withMessage('پست الکترونیکی نمی تواند خالی باشد.').isEmail().withMessage('پست الکترونیکی نادرست می باشد.');
    req.checkBody('password').notEmpty().withMessage('رمز عبور نمی تواند خالی باشد.').isLength({min: 6}).withMessage('رمز عبور باید بیشتر از 6 کاراکتر باشد.');
    var messages = [];
    Admin.findOne({username: req.body.username}, function (error, user) {
        if(error){
            return;
        }
        messages.push('نام کاربری نمی تواند تکراری باشد، نام کاربری دیگری انتخاب کنید.');
    });
    Admin.findOne({email: req.body.email}, function (err, user) {
        if (err){
            return;
        }
        messages.push('پست الکترونیکی نمی تواند تکراری باشد، پست الکترونیکی دیگری انتخاب کنید.');
    });
    var errors = req.validationErrors();
    if(errors || messages.length > 0){
        if(errors){
            errors.forEach(function(message){
                messages.push(message.msg);
            });
        }
        console.log('adadsa');
        res.render('admin/signup', {messages: messages, hasError: messages.length > 0});
        return ;
    }
    var admin = new Admin();
    admin.name = req.body.name;
    admin.username = req.body.username;
    admin.email = req.body.email;
    admin.password = admin.encryptPassword(req.body.password);
    admin.status = 1;
    admin.save(function (error) {
        if (!error){
            res.redirect('/admin/login');
            return;
        }
        console.log(error);
        res.render('admin/signup');
    });
});

module.exports = router;