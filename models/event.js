var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

mongoose.connect('localhost:27017/test');

var eventdataschema = new Schema({
    title: {type: String, required: true},
    date: {type: Date, required: true},
    gradeLow: {type: Number, required: false},
    gradeHigh: {type: Number, required: false},
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
        info: req.body.info,
        gradeLow: req.body.gradeLow,
        gradeHigh: req.body.gradeHigh,
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

module.exports.UpdateEvent = function (req,callback) {
    //event object
    var event = {
        title: req.body.title,
        date: req.body.eventdate,
        info: req.body.info,
        gradeLow: req.body.gradeLow,
        gradeHigh: req.body.gradeHigh,
        limit: req.body.limit,
    };

    //Validation of form fields
    req.checkBody('title', 'title is required').isAlphanumeric();
    req.checkBody('date', 'date is required').isAlphanumeric();
    req.checkBody('info', 'info is required').isAlphanumeric();
    req.checkBody('gradeLow', 'grade is required').isNumber();
    req.checkBody('gradeHigh', 'grade is required').isNumber();
    req.checkBody('limit', 'Limit is required').isNumber();

    var errors = req.validationErrors();

    if (errors) {
        res.render('updateEvent', {
            errors: errors
        });
    }
    else {
        var time = event.date + " " + req.body.time.toString();
        event.date = time;
        var data = new EventData(event);
        data.save(err => {
            if(err) callback(err,null);
        callback(null, 'Event Was Added : \n' + event)
        });
    }
};

module.exports.getChildEvents = function (child,callback) {
    var childEvents = [];
    var promises = [];
    for (x in child) {
        promises.push(new Promise(  function (resolve, reject) {
            //get child event array
            var query = [];
            for (var i = 0; i < child[x].events.length; i++) {
                query.push(new mongoose.Types.ObjectId(child[x].events[i].id));
            }
            //Find on database
            EventData.find({
                '_id': {$in: query}
            }, function (err, docs) {
                if (err) reject();
                //console.log(docs);
                var events = [];
                for (i in docs) {
                    events.push(docs[i]._doc);
                }
                childEvents.push(events);
                resolve('child : ' + x + ' loop\npushed: ' + events);
            });

        }));
    }
    Promise.all(promises)
        .then(function (value) {
            //console.log(value);
            callback(null,childEvents,child);

        });
    callback(null,null,null);

};
