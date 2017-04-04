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
//TODO: csrf error ..........................
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
                res.redirect('/dashboard/posts');
            });
        }
    });

});

router.get('/posts', function (req, res, next) {
    Post.find().populate('user_id').sort({'_id': 'descending'}).exec(function (err, posts) {
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

router.get('/post-delete/:postId', function (req, res, next) {
    Post.findByIdAndRemove(req.params.postId, function (err, offer) {
        if (err){
            res.send(false);
        }else{
            fs.unlinkSync('public/images/uploads/' + offer.image);
            res.send(true);
        }
    });
});

router.get('/post-edit/:postId', function (req, res, next) {
    Post.findById(req.params.postId, function (err, data) {
       if (err){
            req.flash('danger', 'خطا لطفا دوباره تلاش کنید.');
            res.redirect('/dashboard/posts');
       }
        res.render('dashboard/edit', {post: data, title: 'ویرایش' + data.title, csrfToken: 'sad'});
    });
});

router.post('/post-edit/:postId', upload.single('image'), function (req, res, next) {
    Post.findById(req.params.postId, function (err, data) {
        if (err){

        }
        if (!data){

        }
        var messages = validateEditPost(req, res, data);
        var oldImage = 'public/images/uploads/' + data.image;
        data.user_id = req.user.id;
        data.title = req.body.title;
        data.slug = req.body.slug;
        data.body = req.body.body;
        data.updated_at = Date.now();
        console.log(messages);
        if (messages.length > 0){
            //TODO: csrf Token
            return res.render('dashboard/edit', {post: data, title: 'ویرایش' + data.title, csrfToken: 'sad', hasError: messages.length > 0, message: messages})
        }else{
            if (req.file){
                data.image = req.file.filename;
            }
            data.save(function (err, post) {
                if (err){
                    if (req.file){
                        fs.unlinkSync(req.file.path);
                    }
                    messages.push('مسیر نمی تواند تکراری باشد.');
                    return res.render('dashboard/edit', {post: data, title: 'ویرایش' + data.title, csrfToken: 'sad', hasError: messages.length > 0, message: messages})
                }else{
                    if(req.file){
                        fs.unlinkSync(oldImage);
                    }
                    req.flash('success', 'با موفقیت ذخیره شد');
                }
                res.redirect('/dashboard/posts');
            });
        }
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
function validateEditPost(req, res, post){
    var messages = [];
    req.checkBody('title').notEmpty().withMessage('عنوان نمی تواند خالی باشد.');
    req.checkBody('slug').notEmpty().withMessage('مسیر نمی تواند خالی باشد.');
    req.checkBody('body').notEmpty().withMessage('متن نمی تواند خالی باشد.');
    var errors = req.validationErrors();
    if (errors){
        errors.forEach(function (item) {
            messages.push(item.msg);
        });
    }
    return messages;
}
