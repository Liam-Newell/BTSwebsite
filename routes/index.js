var express = require('express');
var router = express.Router();
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
