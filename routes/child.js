//ADD-ONS SECTION
var express = require('express');
var asserts = require('asserts');
var assert = require('assert');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//For mongoDB
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

var Child = require('../models/child');
var User = require('../models/user');

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

//Post: register child (registerchild.hbs).
router.post('/registerchild', function (req, res, next) {
    var userData = req.user();
    var sess = req.user();

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

//Get: childList page (childList.hbs)
router.get('/childList', function (req, res, next) {

    //var monthpassed = req.query.id;
    var childQuery = [];
    var children = [];
    var userDat = req.user;

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