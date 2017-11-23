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
router.get('/calendar/:id', function(req,res, next){
    var string = encodeURIComponent(id);
    res.redirect('/calendar?id=' + string);
});
router.get('/calendar', function (req, res, next) {
    var event = {
        title: req.body.title,
        date: req.body.eventdate,
        info: req.body.info
    };
    var monthpassed = req.query.id;
    EventData.find().sort('-date').then(function(doc)
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

            res.render('Users/calendar',{eventlist : events, size: doc.length, month: monthpassed, year: (new Date()).getFullYear()});
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

module.exports = router;
