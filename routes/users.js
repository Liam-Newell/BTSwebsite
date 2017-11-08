var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

var eventdataschema = new Schema({
    title: {type: String, required: true},
    date: {type: Date, required: true},
    info: {type: String, required: true}
}, {collection: 'events'});

var EventData = mongoose.model('EventData', eventdataschema);

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('Users/createevent');
});
router.get('/calendar', function (req, res, next) {
    res.render('Users/calendar');
})
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
    EventData.find().sort('-date').then(function (doc) {
        res.render('Users/eventDB', {eventlist: doc});
    })
});
router.get('/database', function (req, res, next) {
    EventData.find().sort('-date').then(function (doc) {
        res.render('Users/eventDB', {eventlist: doc});
    })
});

module.exports = router;
