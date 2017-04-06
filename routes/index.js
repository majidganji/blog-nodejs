var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Admin = require('../models/admin');
var comment = require('../models/comment');
var moment = require('moment-jalaali');


router.use(function (req, res, next) {
    req.app.locals.layout = 'layout';
    next();
});

router.get('/', function(req, res, next) {
    Post.find().sort({'_id': 'descending'}).exec(function (err, posts) {
        if (err){

        }
        res.render('index/index', { title: 'Blog', posts: posts});
    });
});

router.get('/post/:slug', function (req, res, next) {
    Post.findOne({slug: req.params.slug}).populate('user_id').exec(function (err, post) {
        if (err){
            console.log(err);
            return;
        }
        if(!post){
            res.status(404);
            res.render('error',{error: {status: 404, stack: 'Not Found ' + req.params.slug}, message: 'Not Found Post', layout: '404'});
            return;
        }
        comment.find({post_id: post._id}).exec(function (err, comments) {
            //TODO: handel error ...
            if (err){}
            res.render('index/post', {
                post: post,
                title: post.title,
                helpers: {
                    date: function (date) {
                        return moment(date).format('jYYYY/jMM/jDD - HH:mm');
                    },
                    year: function (date) {
                        return moment(date).format('jYYYY/jMM/jDD');
                    },
                    time: function (date) {
                        return moment(date).format('HH:mm');
                    },
                    hasChild: function () {
                        comment.find({parent_id: data}, function (err, comments) {
                            if (comments){
                                return true;
                            }
                        });
                    }
                },
                commants: comments
            });
        });
    });
});

router.post('/new-comment', function (req, res, next) {
    console.log(req.body);
    var Commnet = new comment({
        post_id: req.body.post_id,
        parent_id: req.body.parent_id || null ,
        name: req.body.name,
        email: req.body.email,
        body: req.body.comment,
        time: +Date.now()
    });

    var errors = Commnet.validateSync();
    if(errors){
        return res.redirect(req.header('Referer') || '/');
    }
    Commnet.save(function (err, data) {
        //TODO: hendle error ...
        if (err){}
        res.send(true);
    })
});

module.exports = router;
