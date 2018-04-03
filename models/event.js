var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

mongoose.connect('localhost:27017/test');

var eventdataschema = new Schema({
    title: {type: String, required: true},
    date: {type: Date, required: true},
    time: {type: String, required: true},
    grade: {type: Number, required: true},
    limit: {type: Number, required: false},
    info: {type: String, required: true},
    registered: [{type: Schema.Types.ObjectId, ref: 'Child'}]
}, {collection: 'events'});

//instantiate schema as model event
var EventData = module.exports = mongoose.model('EventData', eventdataschema);

/** "Event" related functions **/

module.exports.CreateEvent = function (req,callback) {
    var event = {
        title: req.body.title,
        date: req.body.eventdate,
        time: req.body.ti,
        limit: req.body.limit,
        grade: req.body.grade,
        info: req.body.in
    };
    //var time = event.date + " " + req.body.time.toString();
    //event.date = time;
    var data = new EventData(event);
    data.save(err =>{
        if(err) callback(err,null);
        callback(null,'Event Was Added : \n' + event)
    });
};



