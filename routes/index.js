var express = require('express');
var router = express.Router();
var path    = require("path");
var mongo = require('mongodb');
var assert = require('assert');

var url = 'mongodb://localhost:27017/test';

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
    var resultArray = [];
    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        var cursor = db.collection('data').find();
        cursor.forEach(function(doc, err) {
            assert.equal(null, err);
            resultArray.push(doc);
        }, function() {
            db.close();
            res.render('database', {items: resultArray});
        });
    });
});


router.post('/register', function (req, res, next){

    var item = {
        firstName: req.body.firstName,
        lastName: req.body.lastName
    };

    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
        //create double check to make sure database doesnt contain dual entry
        db.collection('data').insertOne(item, function(err, result) {
            assert.equal(null, err);
            console.log('Item inserted');
            db.close();
        });
    });

    res.redirect('/');
});


//note '/submit' is identicial to in the index.hbs file
router.post('/login', function(req, res, next) {
    //form validation etc
    req.check('lastName', 'Invalid last name').isLength({min:2});
    req.check('firstName','Invalid first name').isLength({min:4});

    var lastName = req.body.lastName;

    var firstName = req.body.firstName;
    var errors = req.validationErrors();
    var results = [];
    mongo.connect(url, function (err, db) {
        var cursor = db.collection('data').find();
        cursor.forEach(function (doc, error) {
                assert.equal(null, error);
                results.push(doc);
            }
            , function () {
                db.close();
            });
    });
    if(!errors || results.length > 0)

        res.render('homepage', {a: firstName, b: lastName, resultlist: results});

    else {
        req.session.errors = errors;
        res.render('index', {
            title: 'Incorrect Values', cuck: 'Ya messed up'
            , success: false, errors: req.session.errors
        });
    }

});

module.exports = router;
