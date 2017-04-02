var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Admin = require('../models/admin');
var moment = require('moment-jalaali');


router.use(function (req, res, next) {
    req.app.locals.layout = 'layout';
    next();
});

router.get('/', function(req, res, next) {
    var posts = Post.find().sort({'_id': 'descending'}).exec(function (err, posts) {
        if (err){

        }
        console.log(posts);
        res.render('index/index', { title: 'Movie', posts: posts});
    });
});

router.get('/post/:slug', function (req, res, next) {
    Post.findOne({slug: req.params.slug}, function (err, post) {
        if (err){
            console.log(err);
            return;
        }
        if(!post){
            res.status(404);
            res.render('error',{error: {status: 404, stack: 'Not Found ' + req.params.slug}, message: 'Not Found Post', layout: '404'});
            return;
        }
        Admin.findById(post.user_id, function (err, admin) {
           console.log(admin);
           var createDate = moment(post.created_at).format('jYYYY/jMM/jDD - HH:mm');
            res.render('index/post', {post: post, title: post.title, editor: admin.name, date: createDate});
        });
    });
});

module.exports = router;
