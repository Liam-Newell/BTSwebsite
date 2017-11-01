var express = require('express');
var router = express.Router();
var path = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('calendar', { title: 'My Schedule'
        , success: false, errors: req.session.errors});
    req.session.errors = null;
});

router.get('/calendar', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

router.post('/submit', function(req, res, next) {

    var lastName = req.body.lastName;
    var firstName = req.body.firstName;
    if(lastName.length > 0 || firstName.length > 1) {
        res.render('test', {a: firstName, b: lastName});
    }
    else {
        res.render('index', {
            title: 'Incorrect Values', cuck: 'Ya messed up'
            , success: false, errors: req.session.errors
        });
    }
});
module.exports = router;