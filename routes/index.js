var express = require('express');
var router = express.Router();
var path    = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Bts Church' , cuck:'liam'
    , success: false, errors: req.session.errors});
    req.session.errors = null;
});
router.get('/index', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

router.post('/submit', function(req, res, next) {
    //form validation etc
    req.check('lastName', 'Invalid last name').isLength({min:2});
    req.check('firstName','Invalid first name').isLength({min:4});
    var lastName = req.body.lastName;

    var firstName = req.body.firstName;

    var errors = req.validationErrors();
    if(!errors)

        res.render('test', {a: firstName, b: lastName});

    else {
        req.session.errors = errors;
        res.render('index', {
            title: 'Incorrect Values', cuck: 'Ya messed up'
            , success: false, errors: req.session.errors
        });
    }

});

module.exports = router;
