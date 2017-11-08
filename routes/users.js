var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

var eventdataschema = new Schema({
    year: {type: Number, min: 2015, max: 2030, required: true},
    day: {type: Number, min: 1, max: 31, required: true},
    info: {type: String, required: true}
}, {collection: 'events'});

var EventData = mongoose.model('EventData', eventdataschema);

/* GET users listing. */
router.get('/', function(req, res, next) {
    EventData.find().then(function (doc) {
        res.render('Users/eventDB', {eventlist: doc});
    })

});

module.exports = router;
