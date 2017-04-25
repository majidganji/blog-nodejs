var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categories = new Schema({
    name: {
        type: String,
        required: [true, 'نام دسته‌بندی نمی‌تواند خالی باشد.']
    },
    slug: {
        type: String,
        required: [true, 'مسیر دسته‌بندی نمی‌تواند خالی باشد.'],
        unique: [true, 'مسیر دسته‌بندی نمی‌تواند تکراری باشد.']
    },
    description: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum:{
            values: ['0', '10'],
            message: 'مقدار وضعیت نامعتبر است.'
        }
    }
});

module.exports = mongoose.model('Categories', categories);