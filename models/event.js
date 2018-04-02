var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

mongoose.connect('localhost:27017/test');

var eventdataschema = new Schema({
    title: {type: String, required: true},
    date: {type: Date, required: true},
    grade: {type: Number, required: true},
    limit: {type: Number, required: false},
    info: {type: String, required: true},
    registered: [{type: Schema.Types.ObjectId, ref: 'Child'}]
}, {collection: 'events'});

//instantiate schema as model event
var EventData = module.exports = mongoose.model('EventData', eventdataschema);

module.exports.CreateEvent = function (req,callback) {
    var event = {
        title: req.body.title,
        date: req.body.eventdate,
        info: req.body.info,
        grade: req.body.grade,
        limit: req.body.limit,
    };
    var time = event.date + " " + req.body.time.toString();
    event.date = time;
    var data = new EventData(event);
    data.save(err =>{
        if(err) callback(err,null);
        callback(null,'Event Was Added : \n' + event)
    });

};
/** "Event" related functions **/
