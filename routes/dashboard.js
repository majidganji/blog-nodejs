var express = require('express');
var csrf = require('csurf');
var multer = require('multer');
var Post = require('../models/post');
var path = require('path');
var fs = require('fs');

var router = express.Router();

router.use(function (req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('backUrl', '/dashboard' + req.url);
    res.redirect('/admin/login');
});

var upload = multer({
    dest: 'public/images/uploads',
    limits: {fileSize: 2e+6, files:1},
    fileFilter: fileFilter,
    rename: function (fieldname, filename) {
        console.log(fieldname);
        console.log(filename);
        return  fieldname + filename + Date.now();
    }
});

var csrfProtection = csrf({ cookie: true });
// router.use(csrfProtection);

router.use(function (req, res, next) {
    req.app.locals.layout = 'dashboard';
    next();
});

router.get('/index', function (req, res, next) {
    res.render('dashboard/index');
});

router.get('/new-post', function (req, res, next) {
    var message = req.flash('error');
    res.render('dashboard/new-post', {csrfToken: 'sad', message: message, hasError: message.length > 0});
});

router.post('/new-post', upload.single('image'), function (req, res, next) {
    var messages = [];
    var post = new Post();
    post.user_id = req.user.id;
    post.title = req.body.title;
    post.slug = req.body.slug;
    post.body = req.body.body;
    post.status = true;
    post.created_at = Date.now();
    post.updated_at = Date.now();
    var error = post.validateSync();
    error = error.errors;
    if(error.title){
        messages.push(error.title.message);
    }
    if(error.slug){
        messages.push(error.slug.message);
    }
    if(error.body){
        messages.push(error.body.message);
    }
    var imagePath = null;
    if (!req.file){
        messages.push('تصویر نمی تواند خالی باشد.');
    }else {
        post.image = req.file.filename;
        imagePath = req.file.path;
    }
    Post.findOne({slug: req.body.slug}, function (err, postslug) {
        if (postslug){
            messages.push('مسیر نمی تواند تکراری باشد، لطفا مسیر دیگری انتخاب کنید.');
        }
        if (messages.length > 0){
            if(imagePath){
                fs.unlinkSync(imagePath);
            }
            res.render('dashboard/new-post', {csrfToken: 'sad', message: messages, hasError: messages.length > 0, post: post});
        }else{
            post.save(function (err, post) {
                if (err){
                    if(imagePath){
                        fs.unlinkSync(imagePath);
                    }
                    req.flash('danger', 'بروز خطا در ذخیره مطلب جدید، دوباره تلاش کنید.');
                }else{
                    req.flash('success', 'با موفقیت ذخیره شد');
                }
                res.redirect('/dashboard/index');
            });
        }
    });

});

router.get('/posts', function (req, res, next) {
    Post.find().populate('user_id').sort({'_id': 'descending'}).exec(function (err, posts) {
        console.log(posts);
        res.render('dashboard/posts', {
            posts: posts,
            title: 'مطالب',
            helpers: {
                index: function (index) {
                    return ++index;
                }
            }
        });
    });
});

module.exports = router;

function fileFilter (req, file, cb) {
    var filetypes = /jpeg|jpg/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(null, false);
}