const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

module.exports = function(Config){
  const userSchema = mongoose.Schema(
  {
    username:
    {
      type: String,
      required: true,
      unique : true
    },
    name:
    {
      type: String,
      required: true,
    },
    surname:
    {
      type: String,
      required: true,
    },
    email:
    {
      type: String,
      required: true,
      unique: true
    },
    role :
    {
      type : String,
      enum : ['user', 'admin'],
      required : true,
      defaults : 'user'
    },
    hash : String,
    salt : String
  })

  userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  };

  userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
  };

  userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
      _id: this._id,
      username: this.username,
      role: this.role,
      exp: parseInt(expiry.getTime() / 1000),
    }, Config.getSalt());
  };

  return mongoose.model("User", userSchema);
}
