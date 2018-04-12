//ADD-ONS SECTION
var express = require('express');
var asserts = require('asserts');
var assert = require('assert');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

//For mongoDB
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

//Models
var User = require('../models/user');

//ROUTER SECTION

/** Register Account (Admin) **/
//Get: register page (register.hbs)
//checks if the user is a registered admin if so passes isAdmin=true to the form
router.get('/adminregister', function(req, res, next){
    if(req.user){res.render('register', {isAdmin: req.user.isAdmin});}
    else{res.render('register');}
});

/** View All Users (Admin) **/
//Get: childList page (childList.hbs)
router.get('/userList', function (req, res, next) {
    User.find({}, function(err, users){
        if(err) throw err;
        else {
            res.render('userList',{ userList: users});
        }
    })
});

/** Deactivate Account (Admin) **/
 router.get('/adminDelete/:id', function(req, res, next){
    var userId = encodeURIComponent(req.params.id);
    User.findByIdAndRemove({_id: userId},
        function(err, user){
        if(err) throw err;
        else res.redirect('/users/userList');
        });
});

/** Register **/
//Get: register page (register.hbs)
router.get('/register', function (req, res, next) {
    res.render('register');
});

//Post: register page (register.hbs)
router.post('/register', function (req, res, next) {

    var item = {
        username: req.body.username,
        password: req.body.password,
        cPassword: req.body.cPassword,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        streetaddress: req.body.streetaddress,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        isAdmin: req.body.isAdmin || false,
        children: []
    };

    //Validation of form fields
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('firstname', 'Firstname is required').notEmpty();
    req.checkBody('lastname', 'Lastname is required').notEmpty();
    req.checkBody('email', 'email is required').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('cPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    }
    else {
        var newUser = new User(item);
        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        })

        //TODO
        //setup passport strategy to allow the use of flash for messages.
        //req.flash('success message', 'You are registered and can now login');
        res.redirect('/users/login');
    }
});

/** Login & Logout**/
//passport localstrategy to validate user login against database
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }));

//serializes user's id in the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

//deserializes user id
passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

//Get: login page (login.hbs)
router.get('/login', function (req, res, next) {
    res.render('login');
});

//authenticates user credentials
router.post('/login',
    passport.authenticate('local', {successRedirect: '/', failureRedirect: '/users/login', failureFlash: true}),
    function (req, res) {
        res.redirect('/', {user: req.user.firstname, isAdmin: req.user.isAdmin});
});

/** Logout **/
//Get: logout page ()
router.get('/logout', function (req, res) {
    req.logout(); //destroys the current session
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

/** Account **/
//Get: account page (account.hbs)
router.get('/account', function (req, res, next) {
    if (req.user) {
        res.render('account', {
            user: req.user.username,
            title: 'Church Centre',
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            email: req.user.email,
            ph1: req.user.phonenumber,
            ph2: req.user.phonenumber2
        });

    } else {
        res.redirect('/')
    }
});

module.exports = router;
