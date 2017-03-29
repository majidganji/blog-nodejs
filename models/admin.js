var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var admin = new Schema({
    name: {type: String, required: true},
    username: {type: String, required: true, unique: true, min: [3, 'نام کاربری نمی تواند کمتر از 3 کاراکتر باشد.']},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, min: [6, 'رمز عبور نمی تواند کمتر 6 کارکتر باشد.']},
    status: Number
});

admin.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password);
};

admin.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('Admin', admin);