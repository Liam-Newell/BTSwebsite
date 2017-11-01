var express = require('express');
var router = express.Router();
var path    = require("path");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Bts Church' , cuck:'liam' });
});
router.get('/index', function(req, res, next) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

router.post('/test', function(req, res, next) {
    var lastName = req.body.lastName;
    var firstName = req.body.lastName;
    res.render('test', { firstName: firstName, lastName:  lastName});
});

module.exports = router;
