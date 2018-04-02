//Models
var User = require('../models/user');
var Child = require('../models/child');
var EventData = require('../models/event');


module.exports.registerChildForEvent = function (req,callback) {
    var item = req.user;
    item.events = [];
    item.events.push(req.body.id);
    //Query and update Child events array with event id
    var childId = req.body.selectChild; //gets selected child id from event form
    var eventId = req.body.id; //gets selected child id from event form
    var log;
    User.findByIdAndUpdate(item._id,
        {$push: {events: req.body.id}},
        {"new": true},
        {"upsert": true},
        function (err, managerevent) {
            if (err) callback(err,null);
            log += 'User.findByIdAndUpdate: ' + managerevent + '\n';
        });

    Child.findByIdAndUpdate(childId,
        {"$push": {"events": req.body.id}},
        {"new": true, "upsert": true},
        function (err, managerevent) {
            if (err) callback(err,null);
            log += 'Child.findByIdAndUpdate: ' + managerevent + '\n';
        }
    );

    //var data = new Child(item);
    //data.save();
    EventData.findByIdAndUpdate(eventId,
        {"$push": {"registered": req.body.selectChild}},
        {"new": true, "upsert": true},
        function (err, managerevent) {
            if (err) callback(err,null);
            log += ' EventData.findByIdAndUpdate ' + managerevent + '\n';
            item.events.push(req.body.id);
            callback(null,log);
        });

};