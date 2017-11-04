var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test' );
var Schema = mongoose.Schema;

var UserLogin = mongoose.model('UserLogin', userLoginSchema);

// User schema
var userDataSchema = new Schema({
    username:       {type: String, required: true},
    password:       {type: String, required: true},
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    address:        {type: String, required: false},
    email:          {type: String, required: false},
    phonenumber:    {type: String, required: false},
    phonenumber2:   {type: String, required: false},
    birthday:       {type: Date, required: false}
}, {collection: 'data'});

// Child schema
var childDataSchema = new Schema({
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    age:            {type: Number, min: 18, max: 99, required: true},
    birthday:       {type: Date, required: true},
    grade:          {type: Number, min: 1, max: 8, required: true}
}, {collection: 'child'});

// Creating models based on schemas
var ChildData = mongoose.model('ChildData', childDataSchema);
var UserData = mongoose.model('UserData', userDataSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Church Centre' , cuck:'liam'
    , success: false, errors: req.session.errors});
    req.session.errors = null;
});

//get login page
router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Church Centre'});
});

//get register page
router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Church Centre'});
});

//get homepage2 (the nice page that will you bust a nut!)
router.get('/homepage2', function (req, res, next) {
    res.render('homepage2', {title: 'Church Centre'});
});

//get test data pagge "database button on '/index'
router.get('/get-data', function (req, res, next) {
    UserLogin.find()
        .then(function(doc) {
            if(doc.length > 0) {
                res.render('database', {items: doc});
            }
            else {
                res.render('index', {title: "database empty!!"});
            }
        });
});

// post page for register
router.post('/register', function (req, res, next){
    var item = {
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        streetaddress: req.body.streetaddress,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        phonenumber2: req.body.phonenumber2,
        birthday: req.body.birthday
    };
    req.check('lastname', 'Invalid last name').isLength({min:2});
    req.check('firstname','Invalid first name').isLength({min:4});
    var errors = req.validationErrors();
    if(!errors){
        var data = new UserData(item);
        data.save();
        res.render(('homepage2'),{a : item.firstname, b:item.lastname, resultlist: 'cuck'});
    }
    else{
        res.render('register', {
            title: 'Incorrect Values', cuck: 'Ya messed up'
            , success: false, errors: req.session.errors
        });
    }
});

//note '/submit' is identicial to in the index.hbs file
router.post('/login', function(req, res, next) {
    //form validation etc
    var item = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password,
        username: req.body.username
    };
    UserLogin.find({firstname : item.firstname, lastname : item.lastname}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');
            res.render('index', {
                title: 'First last name combo doesnt exist', cuck: 'Ya messed up'
                , success: false, errors: req.session.errors
            });
        }
        else {
            res.render('homepage2', {a: doc[0]._doc.firstname, b: doc[0]._doc.lastname, resultlist: doc[0]._doc._id});
        }
    });
});

module.exports = router;
