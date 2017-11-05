var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test' );
var Schema = mongoose.Schema;

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
    birthday:       {type: Date, required: false},
    children:       [
                        {
                            firstname:      {type: String, required: true},
                            lastname:       {type: String, required: true},
                            birthday:       {type: Date, required: false},
                            grade:          {type: Number, min: 1, max: 8, required: true}
                        }
                    ]
    }, {collection: 'data'});

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

//get register page
router.get('/registerchild', function (req, res, next) {
    res.render('registerchild', {title: 'Church Centre'});
});

//get homepage2 (the nice page that will you bust a nut!)
router.get('/homepage2', function (req, res, next) {
    res.render('homepage2', {title: 'Church Centre'});
});

//get calender page currently a work in progress
router.get('/calendar', function (req, res, next) {
    res.render('calendar', {});
});

//get test data page "database button on '/index'
router.get('/get-data', function (req, res, next) {
    UserData.find()
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
        res.render(('homepage2'),{a : item.firstname, b : item.lastname, resultlist: 'cuck'});
        data.save();
        //var child = window.confirm("Add Child?\nEither OK or Cancel.\nThe button you pressed will be displayed in the result window.")
        //{
        //    window.open("exit.html", "Thanks for Visiting!");
        //};
        //if(child == true)
        //{
        //    res.render(('registerchild'),{a : item.firstname, b : item.lastname, resultlist: 'cuck'});
        //}
        //else
        //{
        //    res.render(('homepage2'),{a : item.firstname, b : item.lastname, resultlist: 'cuck'});
        //    data.save();
        //}
    }
    else{
        res.render('register', {
            title: 'Incorrect Values', cuck: 'Ya messed up'
            , success: false, errors: req.session.errors
        });
    }
});

// post page for child registration
router.post('/registerchild', function (req, res, next){
    var item = {
        child:
            [{
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                birthday: req.body.birthday,
                grade: req.body.grade
            }]
    };
    req.check('lastname', 'Invalid last name').isLength({min:2});
    req.check('firstname','Invalid first name').isLength({min:4});
    var errors = req.validationErrors();
    if(!errors){
        var data = new UserData(item);
        data.save();
        res.render(('registerchild'),{a : item.firstname, b:item.lastname, resultlist: 'cuck'});
    }
    else{
        res.render('registerchild', {
            title: 'Incorrect Values', cuck: 'Ya messed up'
            , success: false, errors: req.session.errors
        });
    }
});

//note '/submit' is identicial to in the index.hbs file
router.post('/login', function(req, res, next) {
    //form validation etc
    var item = {
        username: req.body.username,
        password: req.body.password
    };
    UserData.find({username : item.username, password : item.password}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');
            res.render('login', {
                title: 'First last name combo doesnt exist', cuck: 'Ya messed up'
                , success: false, errors: req.session.errors
            });
        }
        else {
            res.render('homepage2', {a: doc[0]._doc.username, b: doc[0]._doc.password, resultlist: doc[0]._doc._id});
        }
    });
});

//note '/submit' is identicial to in the index.hbs file
router.post('/index', function(req, res, next) {
    //form validation etc
    var item = {
        username: req.body.username,
        password: req.body.password
    };
    UserData.find({username : item.username, password : item.password}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');
            res.render('index', {
                title: 'First last name combo doesnt exist', cuck: 'Ya messed up'
                , success: false, errors: req.session.errors
            });
        }
        else {
            res.render('homepage2', {a: doc[0]._doc.username, b: doc[0]._doc.password, resultlist: doc[0]._doc._id});
        }
    });
});

module.exports = router;
