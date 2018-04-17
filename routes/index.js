var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
    res.render('index', {user : req.user.firstname, isAdmin: req.user.isAdmin});
});

//checks if an existing session is in place, if not takes user to login page. If so they may access the site.
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('error_msg','You are not logged in');
        res.redirect('/users/login');
    }
}

module.exports = router;