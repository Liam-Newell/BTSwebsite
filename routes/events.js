//ADD-ONS SECTION
var express = require('express');
var asserts = require('asserts');
var assert = require('assert');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
//Promise = require('bluebird');

//For mongoDB
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');

//For nodemailer
var nodemailer = require('nodemailer');
//var xoauth2 = require('xoauth2');

//Models
var User = require('../models/user');
var Child = require('../models/child');
var EventData = require('../models/event');
var Controller = require('../models/controller');

/* GET users listing. */
router.get('/createevent', function(req, res, next) {
    res.render('createevent');
});

router.get('/updateEvent/:id', function(req, res, next) {
    var eventId = encodeURIComponent(req.params.id);
    var query = EventData.findOne({_id: eventId});
    query.exec(function(err, data){
        if(err) throw err;
        var date = data.date.toISOString().substring(0, 10);
        res.render('updateEvent', {eventId: req.params.id, t: data.title, d: date, i: data.info, gl: data.gradeLow, gh: data.gradeHigh, l: data.limit, ti: data.time});
    });

});

//Router for the sendEmail.hbs page
router.get('/sendEmailPage/:id', function(req, res, next){
    res.render ('sendEmail', {eventId: req.params.id});
});

//Router to actually send the email than redirect back to calender
router.post('/sendEmail/:id', function (req, res, next) {

    //takes eventId
    var eventId = encodeURIComponent(req.params.id);
    var event;
    var children = [];
    var parentsId = [];
    var emails = [];
    var parents = [];
    var registered = [];

    //Get Event
    EventData.findOne({_id: eventId}).then(function (err, doc) {
        if (err) throw err;
        else {
            event = doc;
            console.log("EVENT: " + event);
            registered = event.registered;
        }
    });
    console.log("EVENT: " + event);
    console.log ("REGISTERED " + registered);

    // //Get registered children
    // Child.find({
    //     '_id': {$in: children}
    // }, function(err, docs){
    //     console.log(docs);
    //
    //     for (i in docs) {
    //         children.push(docs[i]._doc);
    //     }
    // });
    //
    //
    // //Get children's parents
    // for(var x = 0; x < children.length; x++)
    // {
    //     parentsId = children[x].parentId;
    // }
    // User.find({
    //     '_id': {$in: parentsId}
    // }, function(err, docs){
    //     console.log(docs);
    //
    //     for (i in docs) {
    //         parents.push(docs[i]._doc);
    //         console.log("PARENTS:" + parents);
    //     }
    // });
    //
    // //get emails
    // for(var x = 0; x < parentsId.length; x++)
    // {
    //     emails = parents[x].email;
    // }
    Controller.massEventEmail(eventId,function(err, emailList){
        if(emailList){
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'bts630churchcentre@gmail.com',
                    pass: 'churchcentre'
                }
            });

            var subject  = req.body.subject;
            var text = req.body.text;

            //PLACEHOLDER
            emailList.push('mnashed333@hotmail.com');

            //gather recepients for registered children
            //add variable of type


            const mailOptions = {
                from: 'bts630churchcentre@gmail.com', // sender address
                to: emailList, // list of recepients. takes in an array of emails
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
        }
    });


    res.redirect('/events/calendar');
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
    Controller.registerChildForEvent(req, function (err, results) {
        if (err) throw err;
        console.log(results);
    });

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

router.post('/updateEvent/:id', function (req, res, next) {
    var eventId = req.params.id;
        var event = {
            title: req.body.title,
            date: req.body.eventdate,
            time: req.body.ti,
            limit: req.body.limit,
            grade: req.body.grade,
            info: req.body.in
        };
    EventData.findById({_id: eventId},
        function(err, event){
    if(err) throw err;
    });

        var time = event.date + " " + req.body.time.toString();
        event.date = time;
        var data = new EventData(event);
        EventData.findByIdAndUpdate({_id: eventId},
        {$set: {
            title: req.body.title,
            date: req.body.eventdate,
            time: req.body.ti,
            limit: req.body.limit,
            grade: req.body.grade,
            info: req.body.in
            }
        },function(err,event) {
                if (err) throw err;
    })
    res.redirect('/events/calendar');
});


//MINAS ADDED CODE.
router.get('/eventlist', function (req, res, next) {

    var monthpassed = req.query.id;
    var childQuery = [];
    children = req.user.children;
    console.log("CHILDREN " + children + " --END");
    var promise1 = new Promise(function(resolve,reject) {
        Child.listChildren(req.user._doc, function (err, list) {
            if (err) throw err;
            childQuery = list;
            resolve()
        });
    });
    promise1.then(function() {
        EventData.getChildEvents(childQuery, function (err,eventlist,child) {
            if(err) alert(err);
            if(eventlist) {
                console.log(eventlist);
                var events = [];
                for (i in eventlist) {
                    events.push(i._doc);
                }
                for (var i = 0; i < eventlist.length; i++){
                    child[i].event = eventlist[i];
                }

                //resolve('child : ' + x + ' loop\npushed: ' + events);
                res.render('eventlist', {childlist: child, output: monthpassed, user: req.user.username});
            }

        });


    });

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
