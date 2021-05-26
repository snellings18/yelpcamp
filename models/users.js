const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})
/* Pluggin in 'passportLocalMongoose' below will automatically provide username and
password options for the UserSchema. It also provides authentication automatically. */
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);