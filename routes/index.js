var express = require('express');
var router = express.Router();
var path    = require("path");
var mongo = require('mongodb');
var assert = require('assert');

var url = 'mongodb://localhost:27017/test';

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Bts Church' , cuck:'liam'
    , success: false, errors: req.session.errors});
    req.session.errors = null;
});


router.post('/register', function (req, res, next){

    var item = {
        firstName: req.body.firstname,
        lastName: req.body.lastname
    };

    mongo.connect(url, function(err, db) {
        assert.equal(null, err);
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

    var cursor = db.collection('data').find();
    cursor.forEach(function(doc, error)
    {
        assert.equal(null, error);
        results.push(doc);
    }
    , function() {
        db.close();
    });

    if(!errors || results.length > 0)

        res.render('test', {a: firstName, b: lastName, resultlist: results});

    else {
        req.session.errors = errors;
        res.render('index', {
            title: 'Incorrect Values', cuck: 'Ya messed up'
            , success: false, errors: req.session.errors
        });
    }

});

module.exports = router;
