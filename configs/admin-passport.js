var passport = require('passport');
var Admin = require('../models/admin');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Admin.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local.login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
},function (req, username, password, done) {
    req.checkBody('username').notEmpty().withMessage('نام کاربری نمی تواند خالی باشد.');
    req.checkBody('password').notEmpty().withMessage('رمز عبور نمی تواند خالی باشد.');
    var errors = req.validationErrors();
    if(errors){
        var messages = [];
        errors.forEach(function(message){
            messages.push(message.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    Admin.findOne({username: username}, function (err, user) {
        if(err){
            return done(err);
        }
        if (!user){
            return done(null, false, {message: 'نام کاربری یا رمز عبور اشتباه می‌باشد.'});
        }
        if (!user.validPassword(password)){
            return done(null, false, {message: 'نام کاربری یا رمز عبور اشتباه می‌باشد.'});
        }
        return done(null, user);
    });
}));

module.exports = passport;
