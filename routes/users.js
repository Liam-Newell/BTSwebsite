var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;
//user schema
var myModule = require('./index');
var userDataSchema = myModule.userDataSchema;
var User = mongoose.model("User", userDataSchema);


var eventdataschema = new Schema({
    title: {type: String, required: true},
    date: {type: Date, required: true},
    info: {type: String, required: true}
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
    EventData.findOne({_id: event}).then(function (doc) {
        res.render('Users/event', {info: doc});
    });
});
router.get('/viewevent/:id', function(req, res, next){
    var event = id;
    EventData.findOne({_id: id}).then(function (doc) {
        res.render('Users/event' , {info: doc});
    });

});
router.post('/registerevent', function (req, res, next) {
    var item = req.session.userDat;
    item.events.push(req.body.id);
    User.findByIdAndUpdate(item._id,
        {"$push": {"events": req.body.id}},
        {"new": true, "upsert": true},
        function (err, managerevent) {
            if (err) throw err;
            console.log(managerevent);
        }
    );
    var data = new User(item);
    data.save();
    req.session.userDat.events.push(req.body.id);
    res.redirect('/');

});
router.get('/calendar', function (req, res, next) {
    var event = {
        title: req.body.title,
        date: req.body.eventdate,
        info: req.body.info
    };
    var monthpassed = req.query.id;
    EventData.find().sort('-date').then(function (doc)
    {

        if(!monthpassed){
            //  var d = new Date();
            // var n = d.getMonth();
            //  n++;
            //  monthpassed = n;
            monthpassed = "november"
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
                year: (new Date()).getFullYear()
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
    res.redirect('database');
});
router.get('/database', function (req, res, next) {
    EventData.find().sort('-date').then(function (doc) {
        res.render('Users/eventDB', {eventlist: doc});
    })
});


//MINAS ADDED CODE. I am trying to get the monthe to pass and display it
router.get('/eventlist', function (req, res, next) {

    var monthpassed = req.query.id;
    var eventQuery = [];
    var eventlist = [];
    for (l in req.session.userDat.events) {
        var o = req.session.userDat.events[l];
        eventQuery.push(new mongoose.Types.ObjectId(o));
    }
    EventData.find({
        '_id': {$in: eventQuery}
    }, function (err, docs) {
        console.log(docs);

        if(!monthpassed){
            monthpassed = "january";
        }

        for (i in docs) {
            eventlist.push(doc[i]._doc);
        }
        // var month = new Date(Date.parse(monthpassed +" 1, 2012")).getMonth()
        // var userEvents = req.session.userDat.events;
        // var events = docs._doc;
        // if(userEvents.length > 0){
        //     for(var j = 0; j < userEvents.length; j++) {
        //         if (doc[j]._doc.date.getMonth() == month) {
        //             events.push(doc[j]._doc);
        //         }
        //     }
        // }

    });
        res.render('Users/eventlist', {eventlist: events, output:monthpassed});
});

router.get('/eventlist/:id', function(req,res, next){
    var string = encodeURIComponent(id);
    res.redirect('eventlist?id=' + string);
});

module.exports = router;
