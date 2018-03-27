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

//Models
var User = require('../models/user');
var Child = require('../models/child');
var EventData = require('../models/event');

/* GET users listing. */
router.get('/createevent', function(req, res, next) {
    res.render('createevent');
});

router.get('/calendar/:id', function(req,res, next){
    var string = encodeURIComponent(id);
    res.redirect('/calendar?id=' + string);
});

router.post('/viewevent', function (req, res, next) {
    var event = req.body.eventid;
    var userDat = req.session;
    var childQuery = [];
    var children = [];

    if(userDat.logged) {
        for (l in req.session.userDat.children) {
            var o = req.session.userDat.children[l];
            childQuery.push(new mongoose.Types.ObjectId(o));
        }
        Child.find({
            '_id': {$in: childQuery}
        }, function (err, docs) {
            console.log(docs);

            for (i in docs) {
                children.push(docs[i]._doc);
            }
        });

        }

    EventData.findOne({_id: event}).then(function (doc) {
        res.render('event', {childList: children, info: doc});
    });
});

router.get('/viewevent/:id', function(req, res, next){
        EventData.findOne({_id: id}).then(function (doc) {
            var user = req.session.userDat;
            var children = user.children;
           res.render('event' , {info: doc, children: children});
        });

});

router.post('/registerevent', function (req, res, next) {

    var item = req.session.userDat;
    item.events.push(req.body.id);

    //Query and update User events array with event id
    User.findByIdAndUpdate(item._id,
        {"$push": {"events": req.body.id}},
        {"new": true, "upsert": true},
        function (err, managerevent) {
            if (err) throw err;
                console.log(managerevent);
        });

    //var data = new User(item);
    //data.save();

    //Query and update Child events array with event id
    var childId = req.body.selectChild; //gets selected child id from event form
    var eventId = req.body.id; //gets selected child id from event form

    Child.findByIdAndUpdate(childId,
        {"$push": {"events": eventId}},
        {"new": true, "upsert": true},
        function (err, managerevent) {
            if (err) throw err;
            console.log(managerevent);
        }
    );

    //var data = new Child(item);
    //data.save();
    EventData.findByIdAndUpdate(eventId,
        {"$push": {"registered": childId}},
        {"new": true, "upsert": true},
        function (err, managerevent) {
            if (err) throw err;
            console.log(managerevent);
        }
    );

    //var data = new EventData(item);
   //data.save();

    req.user.events.push(req.body.id);
    res.redirect('calendar');
});

router.post('/deleteevent', function (req, res, next) {
    EventData.findByIdAndRemove(req.body.id,
        function (err, managerevent) {
            if (err) throw err;
            console.log(managerevent);
        }
    );
    res.redirect('calendar');

});

router.get('/calendar2', function(req, res){
    res.render('/calendar2');
});

router.get('/calendar', function (req, res, next) {
    var event = {
        title: req.body.title,
        date: req.body.eventdate,
        info: req.body.info
    };

    var userDat = req.user;
    var monthpassed = req.query.id;
    if(req.user)
    {
        var redirectTo = "/";
        var username = userDat.username;
    }
    else
    {
        var redirectTo = "";
        var username = "Guest";
    }
    EventData.find().sort('-date').then(function (doc)
    {
        var d = new Date();
        var n = d.getMonth();
        if(!monthpassed){
            //  var d = new Date();
            // var n = d.getMonth();
            //  n++;
            //  monthpassed = n;

            const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            monthpassed = MONTH_NAMES[n].toLowerCase();

        }
        var month = new Date(Date.parse(monthpassed + " " + d.getDate() + ", " + d.getFullYear())).getMonth();
        if(doc.length > 0)
        {
            var events = [];
            event = doc[0]._doc;
            for (var i = 1; i <= 31; i++) {
                var e = {
                    title: '',
                    date: i,
                    info: []

                };
                events.push(e);

            }
            for (var i = 0; i <= 30; i++) {
                var index = 0;
                for (var j = 0; j < doc.length; j++) {
                    if (doc[j]._doc.date.getDate() == i && doc[j]._doc.date.getMonth() == month) {
                        events[(i - 1)].info[index] = doc[j]._doc;
                        index++
                    }
                }
            }

            var event = req.body.eventid;
            var userDat = req.session;
            var childQuery = [];
            var children = [];

            if (userDat.logged) {
                for (l in req.session.userDat.children) {
                    var o = req.session.userDat.children[l];
                    childQuery.push(new mongoose.Types.ObjectId(o));
                }
                Child.find({
                    '_id': {$in: childQuery}
                }, function (err, docs) {
                    console.log(docs);

                    for (i in docs) {
                        children.push(docs[i]._doc);
                    }
                });

            }
            var g = req.session.req.user._doc.children;
            res.render('calendar', {
                isAdmin: req.user.isAdmin,
                eventlist: events,
                size: doc.length,
                month: monthpassed,
                year: (new Date()).getFullYear(),
                user: username,
                redirect: redirectTo,
                childList: req.session.req.user._doc.children
            });
        }
        else{
            res.render('calendar', {isAdmin: req.user.isAdmin});
        }
    });

});

router.post('/createevent', function (req, res, next) {

    var event = {
        title: req.body.title,
        date: req.body.eventdate,
        info: req.body.info
    };
    var time = event.date + " " + req.body.time.toString();
    event.date = time;
    var data = new EventData(event);
    data.save();
    res.redirect('calendar');
});

//MINAS ADDED CODE.
router.get('/eventlist', function (req, res, next) {

    var monthpassed = req.query.id;
    var eventQuery = [];
    var events = [];

    //LIST OF EVENTS CAN ONLY BE ACCESSED IF LOGGED IN - Crashes when this if statement is not in place. S.N.
    if(req.user)
    {
        for (l in req.user.events) {
            var o = req.user.events[l];
            eventQuery.push(new mongoose.Types.ObjectId(o));
        }

        EventData.find({
            '_id': {$in: eventQuery}
        }, function (err, docs) {
            console.log(docs);

            if (!monthpassed) {
                monthpassed = "january";
            }

            for (i in docs) {
                events.push(docs[i]._doc);
            }
        });
        res.render('eventlist', {eventlist: events, output:monthpassed, user: req.user.username});
    }
    else
    {
        res.redirect('/');
    }
});

router.get('/removeChildEvent/:id', function(req, res, next){
    var eventId = encodeURIComponent(req.params.id);
    var userData = req.session.userDat;
    var test = req.body.id;
    EventData.findById(eventId, function (err, docs) {
        if (err) throw err;
        var search = [];
        for (let i = 0; i < req.session.userDat.children.length; i++) {
            search.push(new mongoose.Types.ObjectId(req.session.userDat.children[i]));
        }
        for (var i = 0; i < search.length; i++) {
            for(var j = 0; j < docs._doc.registered.length; j++)
            if (docs._doc.registered[j].toString('hex') === search[i].id.toString('hex')) {
                docs._doc.registered.splice(j, 1);
            }
        }
        docs.save(function (err, rChild) {
            if (err) throw err;
            console.log("Successfully removed from event "+rChild);

        });
    });
    User.findById(req.session.userDat._id, function (err, user){
        if (err) throw err;
        for(let i = 0; i < user._doc.events.length; i++){
            if(user._doc.events[i]._id === eventId){
                user._doc.events.splice(i, 1);
            }

        }
        req.session.userDat.events = user._doc.events;
        user.save(function (err, doc){
            if (err) throw err;
            console.log("Successfully removed from user "+doc);
        });
        res.redirect('eventlist');
    });
    // EventData.findByIdAndUpdate(eventId,
    //     {"": {"registered": "test"}},
    //     function(err, updatedEvent){
    //         if(err) throw err;
    //     })
});
/*
router.get('/eventlist/:id', function(req,res, next){
    var string = encodeURIComponent(id);
    res.redirect('eventlist?id=' + string);
});
*/


module.exports = router;
