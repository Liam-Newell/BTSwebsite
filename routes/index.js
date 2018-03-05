//ADD-ONS SECTION
var express = require('express');
var asserts = require('asserts');
var assert = require('assert');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

//Models
var User = require('../models/user');
var Child = require('../models/child');

//For mongoDB
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

//For sessions
var expressSession = require('express-session');
router.use(expressSession({secret: 'max', saveUninitialized: false, resave: false}));

//ROUTER SECTION

//GETTERS
//
//Get: log-in page (index.hbs)
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Church Centre' ,
        success: false,
        errors: req.session.errors
    });
    req.session.errors = null;
});

//Get: register page (register.hbs)
router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Church Centre'});
});

//Post: register page (register.hbs)
router.post('/register', function (req, res, next){

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

    if(errors)
    {
        res.render('register',{
            errors:errors
        });
    }
    else
    {
        var newUser = new User(item);
        User.createUser(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        })

        //TODO
        //setup passport strategy to allow the use of flash for messages.
        //req.flash('success message', 'You are registered and can now login');
        res.redirect('/');
    }

    /* //Session
     var sessData = req.session;
     if (sessData.logged)
         req.session.destroy(function (err) {
             if (err)
                 console.log(err);
         });
     sessData.logged = true;
     sessData.userDat = doc._doc;
     res.redirect('/homepage2');


 //Logging in new user - temp fix  || S.N
 else {
     res.render('register', {
         title: errors,
         success: false,
         errors: req.session.errors
     });
 }*/
});

//Get: login page (login.hbs)
router.get('/login', function (req, res, next) {
    res.render('login');
});

passport.use(new localStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: "Unknown User"});
            }
            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch) {
                    return done(null, user);
                }else{
                    return done(null, false, {message: 'Invalid password'});
                }
            })
        })
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {successRedirect: '/homepage2', failureRedirect: '/index',failureFlash: true}),
    function(req, res) {
        res.redirect('homepage2');
    });


//Get: account page (account.hbs)
router.get('/account', function (req, res, next) {
    var sess = req.session;
    var userData = sess.userDat;

    if(sess.logged) {
        var bday = new Date (userData.birthday).toUTCString();
        console.log(bday);

        res.render('account', {
            user: sess.userDat.username,
            title: 'Church Centre',
            firstname: userData.firstname,
            lastname: userData.lastname,
            dob: bday,
            email: userData.email,
            ph1: userData.phonenumber,
            ph2: userData.phonenumber2
        });

    }else{
        res.redirect('localhost:3000')
    }
});

//Get: registerchild page (registerchild.hbs)
router.get('/registerchild', function (req, res, next) {
    var sess = req.session;
    var userData = sess.userDat;

    if(sess.logged) {

        res.render('registerchild', {
            user: userData.username
        });

    }else{
        res.render('index', {title: 'Church Centre'});
    }
});

//Get: homepage (homepage2.hbs)
router.get('/homepage2', function (req, res, next) {

    var userInfo = req.session;

    if(userInfo.logged){

        res.render('homepage2', {
            user: userInfo.userDat.username,
            title: 'Church Centre'
        });

    }else{
        res.redirect('/');
    }

});

//Get: sign-out sequence
router.get('/sign-out', function(req, res, next) {

    var sess = req.session;
    var userData = sess.userDat;

    if(sess.logged){
        req.session.destroy(function (err) {

            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }

        });

    }else{
        res.redirect('/')
    }
});

//POSTS


/*
//Post: login sequence (index.html)
router.post('/login', function(req, res, next) {
    //form validation etc
    var item = {
        username: req.body.username,
        password: req.body.password
    };

    User.find({username : item.username, password : item.password}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');

            res.render('login',{
                title: 'First last name combo doesnt exist',
                cuck: 'Ya messed up',
                success: false, errors: req.session.errors
            });

        }else{

            var sessData = req.session;
            if (sessData.logged)
                req.session.destroy(function (err) {
                    if (err)
                        console.log(err);
                });
            sessData.logged = true;
            sessData.userDat = doc[0]._doc;
            console.log(sessData.userDat.email);
            //res.render('homepage2', {user: sessData.username, a: doc[0]._doc.username, b: doc[0]._doc.password, resultlist: doc[0]._doc._id});
            res.redirect('/homepage2');
        }
    });
});
*/

//Get: childList page (childList.hbs)
router.get('/childList', function (req, res, next) {

    //var monthpassed = req.query.id;
    var childQuery = [];
    var children = [];
    var userDat = req.session;

    //LIST OF CHILDREN CAN ONLY BE ACCESSED IF LOGGED IN - Crashes when this if statement is not in place. S.N.
    if(userDat.logged)
    {
        if(req.session.userDat.children.length > 0 ) {
            if (!req.session.childrenCache) {
                for (var i = 0; i < req.session.userDat.children.length; i++) {
                    var o = req.session.userDat.children[i];
                    childQuery.push(new mongoose.Types.ObjectId(o));
                }
                Child.find({
                    '_id': {$in: childQuery}
                }, function (err, docs) {
                    console.log(docs);
                    req.session.childrenCache = null;
                    req.session.childrenCache = [];
                    for (i in docs) {
                        req.session.childrenCache.push(docs[i]._doc);
                    }
                    res.render('childList', {
                        childList: req.session.childrenCache,
                        user: userDat.userDat.username,
                        title: "Registered Children | Church Centre"
                    });
                });
            }else {
                res.render('childList', {childList: req.session.childrenCache, user: userDat.username, title: "Registered Children | Church Centre"});
            }
        }
        else{
            res.render('childList', {user: userDat.username, title: "Registered Children | Church Centre"});
        }



    }
    else
    {
        res.redirect('/');
    }

});

//Post: register child (registerchild.hbs).
router.post('/registerchild', function (req, res, next) {
    var userData = req.session.userDat;
    var sess = req.session;

    var item = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        grade: req.body.grade
    };

    if(sess.logged){

            req.check('lastname', 'Invalid last name').isLength({min: 2});
            req.check('firstname', 'Invalid first name').isLength({min: 4});

            var errors = req.validationErrors();
            if(req.session.childrenCache){
                req.session.childrenCache = null;
            }
            if (!errors) {
                var data = new Child(item);
                var cid = data._id;
                data.save();
                var userItem = req.session.userDat;
                User.findByIdAndUpdate(userItem._id,
                    {$push: {children: cid}},
                    {new : true}, function (err, childreg){
                        if (err) throw err;
                        console.log(childreg);
                        //data.save();
                        req.session.userDat.children.push(data._id.toString('hex'));
                        res.redirect('/childList');
                }

                );

            }
            else {

                res.render('registerchild'),{
                    title: 'Incorrect Values',
                    cuck: 'Ya messed up',
                    success: false,
                    errors: req.session.errors

                };
            }
    }
});
//Remove Child from the account
router.get('/deletechild/:id', function (req, res, next) {
    var childID = encodeURIComponent(req.params.id);
    var search = new mongoose.Types.ObjectId(childID);
    var found = false;
    var userData = req.session.userDat;
    var sess = req.session;
    //get Child ID
    if(sess.logged)
    {
        if(req.session.childrenCache){
            req.session.childrenCache = null;
        }
            //Remove Link to User Account as well
        Child.findByIdAndRemove(childID, (err, child) => {
                if (err) throw err;
                console.log(child);
            });
        User.findById(userData._id, function (err, user) {
            if (err) throw err;
            var search = new mongoose.Types.ObjectId(childID);
            for(var i = 0;i < user._doc.children.length; i++){
                if(user._doc.children[i].id.toString('hex') === search.id.toString('hex')){
                    user._doc.children.splice(i, 1);
                }
            }
            user.save(function (err) {
                if (err) throw err;
                console.log(user);
            });
            // User.findByIdAndRemove(childID);
            //Remove Child from database


        });
    }
    else
    {
        res.redirect('/');
    }
    res.redirect('/childList');
});


//Post: '/submit' is identicial to in the index.hbs file
router.post('/index', function(req, res, next) {
    //form validation etc
    var item = {
        username: req.body.username,
        password: req.body.password
    };
    User.find({username : item.username, password : item.password}).then(function(doc){
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
