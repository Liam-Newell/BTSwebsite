//Models
var User = require('../models/user');
var Child = require('../models/child');
var EventData = require('../models/event');


module.exports.registerChildForEvent = function (req,callback) {
    var item = req.user._doc;
    const event = req.body.id;

    //Query and update Child events array with event id
    var childId = req.body.selectChild; //gets selected child id from event form
    var eventId = req.body.id; //gets selected child id from event form
    var log;

    //item.events = [];

    var promise2 = new Promise(function (passed,failed) {

        Child.findByIdAndUpdate(childId,
            {"$push": {"events": req.body.id}},
            {"new": true, "upsert": true},
            function (err, managerevent) {
                if (err) callback(err, null);
                log += 'Child.findByIdAndUpdate: ' + managerevent + '\n';
                passed();
            }
        );
    });
    var promise3 = new Promise(function (passed,failed) {
        EventData.findByIdAndUpdate(eventId,
            {"$push": {"registered": req.body.selectChild}},
            {"new": true, "upsert": true},
            function (err, managerevent) {
                if (err) callback(err,null);
                log += ' EventData.findByIdAndUpdate ' + managerevent + '\n';
                passed();
            });
    });
    Promise.all([promise2,promise3]).then(function (value) {
        console.log(value);
       // item.events.push(req.body.id);
        callback(null,log);
    });
};