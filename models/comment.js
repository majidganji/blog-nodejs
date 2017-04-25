var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var comment = new Schema({
    post_id: {type: Schema.Types.ObjectId, ref: 'Posts', required: true},
    parent_id: {type: Schema.Types.ObjectId, ref: 'comments', required: false},
    name: {type: String, required: true},
    email: {type: String, required: true},
    body: {type: String, requried: true},
    status: {type: Number, required: true},
    time: {type: Number, required: true}
});

module.exports = mongoose.model('comments', comment);