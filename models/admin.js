var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var admin = new Schema({
    name: {
        type: String,
        required: [true, 'نام اجباری است.']
    },
    username: {
        type: String,
        required: [true, 'نام کاربری اجباری است.'],
        unique: [true, 'نام کاربری نمی تواند تکراری باشد.'],
        min: [3, 'نام کاربری نمی تواند کمتر از 3 کاراکتر باشد.']
    },
    email: {
        type: String,
        required: [true, 'پست الکترونیکی اجباری است.'],
        unique: [true, 'پست الکترونیکی نمی‌تواند تکراری باشد.'],
        validate: {
            validator: function(v) {
                return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(v);
            },
            message: 'پست الکترونیکی {VALUE} نامعتبر است!'
        }
    },
    password: {
        type: String,
        required: [true, 'رمز عبور اجباری است.'],
        validate: {
            validator: function(v) {
                return !(v.length < 6);
            },
            message: 'رمز عبور نمی تواند کمتر 6 کارکتر باشد.'
        }
    },
    status: {
        type: String,
        required: [true, 'وضعیت کاربر نمی‌تواند خالی باشد.'],
        enum:{
            values:['0', '1', '9', '10'],
            message: 'مقدار وضعیت نامعتبر است.'
        }
    }
});

admin.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password);
};

admin.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Admin', admin);