var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var post = new Schema({
    user_id: {type: Schema.Types.ObjectId, ref: 'Admin', required: true},
    category_id: {type: Schema.Types.ObjectId, ref:'Categories', required: true},
    title: {type: String, required: [true, 'عنوان نمی تواند خالی باشد.']},
    body: {type: String, required: [true, 'متن نمی تواند خالی باشد.']},
    image: {type: String, required: [true, 'مطلب باید تصویر داشته باشد، لطفا تصویر مناسب انتخاب کنید.']},
    slug: {type: String, required: [true, 'مسیر نمی تواند خالی باشد.'], unique: [true, 'مسیر نمی تواند تکراری باشد، لطفا مسیر دیگری انتخاب کنید.']},
    publish: {type: String, required: true},
    created_at: Date,
    updated_at: Date
});

module.exports = mongoose.model('Posts', post);