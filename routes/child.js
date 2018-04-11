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
var Event = require('../models/event');

//Get: registerchild page (registerchild.hbs)
router.get('/registerchild', function (req, res, next) {
    var userData = req.user;
    if(req.user) {
        res.render('registerchild', {
            user: userData.username
        });
    }else{
        res.render('index', {title: 'Church Centre'});
    }
});

//Post: register child (registerchild.hbs).
router.post('/registerchild', function (req, res, next) {
    var user = req.user;
    var item = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        grade: req.body.grade,
        parent: req.user._id
    };

    if(req.user){

        req.check('lastname', 'Invalid last name').isLength({min: 2});
        req.check('firstname', 'Invalid first name').isLength({min: 2});

        var errors = req.validationErrors();
        if(user.childrenCache){
            user.childrenCache = null;
        }
        if (!errors) {
            var data = new Child(item);
            var cid = data._id;
            data.save();
            var userItem = user;
            User.findByIdAndUpdate(userItem._id,
                {$push: {children: cid}},
                {new : true}, function (err, childreg){
                    if (err) throw err;
                    console.log(childreg);
                    //data.save();
                    req.user.children.push(data._id.toString('hex'));
                    res.redirect('childList');
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
    var userDat = req.session.req.user._doc;
    Child.listChildren(req.session.req.user._doc, function(err, list){
        if(err) throw err;
        if(!list){
            res.render('childList',{
                user: userDat.username,
                title: "Registered Children | Church Centre"}
            );
        }
        else{
            res.render('childList', {
                childList: list,
                user: userDat.username,
                title: "Registered Children | Church Centre"
            })
        }
    });
});

//Remove Child from the account
router.get('/deletechild/:id', function (req, res, next) {
    var childID = encodeURIComponent(req.params.id);
    var search = new mongoose.Types.ObjectId(childID);
    var found = false;
    var userData = req.user;
    var sess = req.session;

    //get Child ID
    if(req.user)
    {
        if(req.user.childrenCache){
            req.user.childrenCache = null;
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

    res.redirect('/child/childlist');
});

module.exports = router;