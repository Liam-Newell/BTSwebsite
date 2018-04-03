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

    var promise2 = new Promise(function (passed) {

        Child.findByIdAndUpdate(childId,
            {"$addToSet": { "events": req.body.id }},
            {"new": true, "upsert": true},
            function (err, managerevent) {
                if (err) callback(err, null);
                log += 'Child.findByIdAndUpdate: ' + managerevent + '\n';
                passed('Child script was a success');
            }
        );
    });
    var promise3 = new Promise(function (passed) {
        EventData.findByIdAndUpdate(eventId,
            {"$addToSet": { "registered": req.body.selectChild }},
            {"new": true, "upsert": true},
            function (err, managerevent) {
                if (err) callback(err,null);
                log += ' EventData.findByIdAndUpdate ' + managerevent + '\n';
                passed('Event script was a success');
            });
    });
    Promise.all([promise2,promise3]).then(function (value) {
        console.log(value);
    });
    // item.events.push(req.body.id);
    callback(null,log);
};
/**
@param {eventid._id} eventid
 **/
module.exports.massEventEmail = function(eventid, callback){
    var childList = [];
    var parentList = [];
    var promise1 = new Promise(function(resolve, reject){
        EventData.findOne(eventid, function (err, currEvent) {
            if(err) callback('failed in the event query for mass email')
            childList = currEvent.registered;
        });
    }).then(function () {
        var childQuery = [];
        for (var i = 0; i < childList.length; i++) {
            var o = childList[i];
            childQuery.push(new mongoose.Types.ObjectId(o));
        }
        var promise = new Promise(function (resolve, reject){
            Child.find({
            '_id': {$in: childQuery}
        }, function (err, docs) {
            if(err) callback('failed inside of child query for mass email',null);
            console.log(docs);
            for (i in docs) {
                parentList.push(docs[i]._doc.parent);
            }
            });
        }).then(function(){
            var promise2 = new Promise(function(resolve, reject){

            })
        });
    });

};