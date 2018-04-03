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

//For nodemailer
var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');

//Models
var User = require('../models/user');
var Child = require('../models/child');
var EventData = require('../models/event');
var Controller = require('../models/controller');

/* GET users listing. */
router.get('/createevent', function(req, res, next) {
    res.render('createevent');
});

//Router for the sendEmail.hbs page
router.get('/sendEmailPage', function(req, res, next){


    res.render ('sendEmail');
});

//Router to actually send the email than redirect back to calender
router.post('/sendEmail', function (req, res, next) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'bts630churchcentre@gmail.com',
            pass: 'churchcentre'
        }
    });

    var subject  = req.body.subject;
    var text = req.body.text;



    const mailOptions = {
        from: 'bts630churchcentre@gmail.com', // sender address
        to: 'mnashed333@hotmail.com', // list of receivers
        subject: subject, // Subject line
        html: text// plain text body
    };

    //Function to actually send the email
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            console.log(err)
        else
            console.log(info);
    });

    res.redirect('calendar');
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
    //item.events.push(req.body.id);
    //Query and update Child events array with event id
    var childId = req.body.selectChild; //gets selected child id from event form
    var eventId = req.body.id; //gets selected child id from event form

    Controller.registerChildForEvent(req, function (err,results) {
        if(err) throw err;
        console.log(results);
    });
    // //Query and update User events array with event id
    // User.findByIdAndUpdate(item._id,
    //     {"$push": {"events": req.body.id}},
    //     {"new": true, "upsert": true},
    //     function (err, managerevent) {
    //         if (err) throw err;
    //             console.log(managerevent);
    //     });
    //
    // //var data = new User(item);
    // //data.save();
    //
    //
    // Child.findByIdAndUpdate(childId,
    //     {"$push": {"events": eventId}},
    //     {"new": true, "upsert": true},
    //     function (err, managerevent) {
    //         if (err) throw err;
    //         console.log(managerevent);
    //     }
    // );
    //
    // //var data = new Child(item);
    // //data.save();
    // EventData.findByIdAndUpdate(eventId,
    //     {"$push": {"registered": childId}},
    //     {"new": true, "upsert": true},
    //     function (err, managerevent) {
    //         if (err) throw err;
    //         console.log(managerevent);
    //     }
    // );

    //var data = new EventData(item);
   //data.save();


    res.redirect('calendar');
});

router.post('/deleteevent', function (req, res, next) {
    EventData.findByIdAndRemove(req.body.event_id,
        function (err, managerevent) {
            if (err) throw err;
            console.log(managerevent);
            res.redirect('calendar');
        }
    );

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

            Child.listChildren(req.session.req.user._doc,function(err, list){
                if (err) throw err;
                if (!list) children.push('none');
                else{
                    children = list;
                }
                res.render('calendar', {
                    isAdmin: req.user.isAdmin,
                    eventlist: events,
                    size: doc.length,
                    month: monthpassed,
                    year: (new Date()).getFullYear(),
                    user: username,
                    redirect: redirectTo,
                    childList: children
                });
            });
            // if (userDat.logged) {
            //     for (l in req.session.userDat.children) {
            //         var o = req.session.userDat.children[l];
            //         childQuery.push(new mongoose.Types.ObjectId(o));
            //     }
            //     Child.find({
            //         '_id': {$in: childQuery}
            //     }, function (err, docs) {
            //         console.log(docs);
            //
            //         for (i in docs) {
            //             children.push(docs[i]._doc);
            //         }
            //     });
            //
            // }
            // var g = req.session.req.user._doc.children;

        }
        else{
            res.render('calendar', {isAdmin: req.user.isAdmin});
        }
    });

});

router.post('/createevent', function (req, res, next) {
    EventData.CreateEvent(req,function (err, result) {
        if(err) throw err;
        console.log(result);
        res.redirect('calendar');
    })
});

//MINAS ADDED CODE.
router.get('/eventlist', function (req, res, next) {

    var monthpassed = req.query.id;
    var eventQuery = [];
    var events = [];
    var childrenInfo = [];
    var childQuery = [];
    var children = [];
    var childEvents = [];
    children = req.user.children;
    console.log("CHILDREN " + children + " --END");
    //LIST OF EVENTS CAN ONLY BE ACCESSED IF LOGGED IN - Crashes when this if statement is not in place. S.N.
    if(req.user)
    {
        for (l in req.user.events) {
            var o = req.user.events[l].toString();
            eventQuery.push(new mongoose.Types.ObjectId(o));
        }/*
        for (l in req.user.children) {
            var o = req.user.children[l].toString();
            console.log(o);
            childQuery.push(new mongoose.Types.ObjectId(o));
        }
        console.log(childQuery);*/
        //Child Getter
        Child.find({
            '_id': {$in: children}
        }, function (err, docs) {
            console.log(docs);
            for (i in docs) {
                childrenInfo.push(docs[i]._doc);
            }
            //Getting event from child
            childEvents = new Array(childrenInfo.length);
            for (var y = 0; y < childEvents; y++)
            {
                childEvents[y] = new Array;
            }
            for (x in childrenInfo)
            {
                //get child event array
                var c = childrenInfo[x].events;
                //Find on database
                EventData.find({
                    '_id': {$in: c}
                }, function (err, docs) {
                    console.log(docs);
                    if (!monthpassed) {
                        monthpassed = "january";
                    }
                    for (i in docs) {
                        events.push(docs[i]._doc);
                    }
                    childEvents[x] = events;
                });
            }
        });

        /*EventData.find({
            '_id': {$in: eventQuery}
        }, function (err, docs) {
            console.log(docs);

            if (!monthpassed) {
                monthpassed = "january";
            }

            for (i in docs) {
                events.push(docs[i]._doc);
            }
        });*/
        res.render('eventlist', {eventlist: childEvents, output:monthpassed, user: req.user.username});
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


//Router for the sendEmail.hbs page

module.exports = router;
