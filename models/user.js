var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

mongoose.connect('localhost:27017/test');

//User schema
var userDataSchema = new Schema({
    username:       {type: String, required: true},
    password:       {type: String, required: true},
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    streetaddress:  {type: String, required: false},
    email:          {type: String, required: false},
    phonenumber:    {type: String, required: false},
    isAdmin:        {type: Boolean, required: true},
    children:       [{type: Schema.Types.ObjectId, ref: 'Child'}], //an array of child ObjectID's referencing Child collection
}, {collection: 'data'});

//Instantiation of "User" schema
var User = module.exports = mongoose.model('User', userDataSchema);

//"User" related functions

module.exports.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
            newUser.password = hash;
            newUser.save();
        })
    })
}

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
}

module.exports.comparePassword = function(inputPassword, hash, callback){
    bcrypt.compare(inputPassword, hash, function(err, isMatch){
        if(err) throw err;
        callback(null, isMatch);
    })
}

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

module.exports.getOneUserLogin = function(user, pass, callback){
    var query =  {username : user, password : pass};
    User.findOne(query, callback);
}
