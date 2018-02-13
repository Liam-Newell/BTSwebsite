var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

//var popupS = require('popups');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

//user schema
var myModule = require('./index');
var userDataSchema = myModule.userDataSchema;
var User = mongoose.model("User", userDataSchema);
var childDataSchema = myModule.childDataSchema;
var Child = mongoose.model("Child", childDataSchema);


var eventdataschema = new Schema({
    title: {type: String, required: true},
    date: {type: Date, required: true},
    info: {type: String, required: true},
    registered: [{type: Schema.Types.ObjectId, ref: 'Child'}]
}, {collection: 'events'});

//instantiate schema as models "User" and "Child"
var EventData = mongoose.model('EventData', eventdataschema);

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('Users/createevent');
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
        res.render('Users/event', {childList: children, info: doc});
    });
});

router.get('/viewevent/:id', function(req, res, next){
        EventData.findOne({_id: id}).then(function (doc) {
            var user = req.session.userDat;
            var children = user.children;
           res.render('Users/event' , {info: doc, children: children});
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

    req.session.userDat.events.push(req.body.id);
    res.redirect('./calendar');
});

router.post('/deleteevent', function (req, res, next) {
    EventData.findByIdAndRemove(req.body.id,
        function (err, managerevent) {
            if (err) throw err;
            console.log(managerevent);
        }
    );
    res.redirect('./calendar');

});

router.get('/calendar', function (req, res, next) {
    var event = {
        title: req.body.title,
        date: req.body.eventdate,
        info: req.body.info
    };
    var userDat = req.session;
    var monthpassed = req.query.id;
    if(userDat.logged)
    {
        var redirectTo = "homepage2";
        var username = userDat.username;
    }
    else
    {
        var redirectTo = "";
        var username = "Guest";
    }
    EventData.find().sort('-date').then(function (doc)
    {

        if(!monthpassed){
            //  var d = new Date();
            // var n = d.getMonth();
            //  n++;
            //  monthpassed = n;
            monthpassed = "january"
        }
        var month = new Date(Date.parse(monthpassed +" 1, 2012")).getMonth()
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
            for(var j = 0; j < doc.length; j++) {
                    if (doc[j]._doc.date.getDate() == i && doc[j]._doc.date.getMonth() == month) {
                        events[(i - 1)].info[index] = doc[j]._doc;
                        index++
                    }
                }
            }

            res.render('Users/calendar', {
                eventlist: events,
                size: doc.length,
                month: monthpassed,
                year: (new Date()).getFullYear(),
                user: username,
                redirect: redirectTo
            });
        }
        else{
            res.render('Users/calendar', {title : 'cucked'});
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

router.get('/database', function (req, res, next) {
    EventData.find().sort('-date').then(function (doc) {
        res.render('Users/eventDB', {eventlist: doc});
    })
});

//MINAS ADDED CODE.
router.get('/eventlist', function (req, res, next) {

    var monthpassed = req.query.id;
    var eventQuery = [];
    var events = [];
    var userDat = req.session;

    //LIST OF EVENTS CAN ONLY BE ACCESSED IF LOGGED IN - Crashes when this if statement is not in place. S.N.
    if(userDat.logged)
    {
        for (l in req.session.userDat.events) {
            var o = req.session.userDat.events[l];
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
        res.render('Users/eventlist', {eventlist: events, output:monthpassed, user: userDat.username});
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
        for (var i = 0; i < docs._doc.registered.length; i++) {
            for(var j = 0; j < search.length; j++)
            if (docs._doc.registered[i].id.toString('hex') === search[j].id.toString('hex')) {
                docs._doc.registered.splice(i, 1);
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
                user._doc.registered.splice(i, 1);
            }

        }
        user.save(function (err, doc){
            if (err) throw err;
            console.log("Successfully removed from user "+doc);
        });
        res.redirect('Users/eventlist');
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
