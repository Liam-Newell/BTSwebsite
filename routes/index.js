var express = require('express');
var router = express.Router();
var path    = require("path");
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true}
}, {collection: 'data'});


var UserData = mongoose.model('UserData', userDataSchema);

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
            res.render('database', {items: doc});
        });
});


router.post('/register', function (req, res, next){

    var item = {
        firstName: req.body.firstName,
        lastName: req.body.lastName
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
   var id = req.body.id;
    UserData.find(id , function(err,doc){
        if(err){
            console.error('no login exists');
            res.render('index', {
                title: 'First last name combo doesnt exist', cuck: 'Ya messed up'
                , success: false, errors: req.session.errors
            });
        }
        res.render('homepage', {a: doc.firstname, b: doc.lastname, resultlist: doc._id});
    })



});

module.exports = router;
