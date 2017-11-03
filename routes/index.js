var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
    username:       {type: String, required: true},
    password:       {type: String, required: true},
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    address:        {type: String, required: true},
    email:          {type: String, required: true},
    phonenumber:    {type: String, required: true},
    phonenumber2:   {type: String, required: false},
    birthday:       {type: Date, required: true},
    rolecode:       {type: String, required: true},
    children:       ["child"]
}, {collection: 'user'});

var UserData = mongoose.model('UserData', userDataSchema);

var childDataSchema = new Schema({
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    age:            {type: Number, min: 18, max: 99, required: true},
    birthday:       {type: Date, required: true},
    grade:          {type: Number, min: 1, max: 8, required: true}
}, {collection: 'child'});

var ChildData = mongoose.model('ChildData', childDataSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Church Centre' , cuck:'liam'
    , success: false, errors: req.session.errors});
    req.session.errors = null;
});
router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Church Centre'});
});
router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Church Centre'});
});


router.get('/get-data', function (req, res, next) {
    UserData.find()
        .then(function(doc) {
            if(doc.length > 0) {
                res.render('database', {items: doc});
            }
            else {
                res.render('index', {title: "database empty!"});
            }
        });
});


router.post('/register', function (req, res, next){

    var item = {
        userName: req.body.userName,
        passWord: req.body.passWord,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        streetAddress: req.body.streetAddress,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        phoneNumber2: req.body.phoneNumber2,
        dateOfBirth: req.body.dateOfBirth,
        roleCode: req.body.roleCode
    };
    req.check('lastName', 'Invalid last name').isLength({min:2});
    req.check('firstName','Invalid first name').isLength({min:4});
    var errors = req.validationErrors();
    if(!errors){
    var data = new UserData(item);
    if(data.on())
        console.log('Entry Inserted');
    data.save();
}
    res.render('register', {
        title: 'Incorrect Values', cuck: 'Ya messed up'
        , success: false, errors: req.session.errors
    });
});


//note '/submit' is identicial to in the index.hbs file
router.post('/login', function(req, res, next) {
    //form validation etc
    var item = {
        firstname: req.body.firstname,
        lastname: req.body.lastname
    };
    UserData.find({firstname : item.firstname, lastname : item.lastname}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');
            res.render('index', {
                title: 'First last name combo doesnt exist', cuck: 'Ya messed up'
                , success: false, errors: req.session.errors
            });
        }
        else {
            res.render('homepage', {a: doc[0]._doc.firstname, b: doc[0]._doc.lastname, resultlist: doc[0]._doc._id});
        }
    });



});

module.exports = router;
