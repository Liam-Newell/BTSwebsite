//Models
var User = require('../models/user');
var Child = require('../models/child');
var EventData = require('../models/event');

//mongoose
var mongoose = require('mongoose');

module.exports.registerChildForEvent = function (req,callback) {
    var item = req.user._doc;
    const event = req.body.id;

    //Query and update Child events array with event id
    var childId = req.body.selectChild; //gets selected child id from event form
    var eventId = req.body.id; //gets selected child id from event form
    var log;
    var registeredCount = Math.round(req.body.registered.length / 24);
    var gradeError = true;
    var registeredError = true;

    //item.events = [];
    var promise1 = new Promise(function (passed) {
        Child.findById(childId, function (err, child) {
            if (err) callback(err, null);
            if(registeredCount < req.body.limit) {
            registeredError = false;
                if (child.grade >= req.body.gradeLow && child.grade <= req.body.gradeHigh) {
                    gradeError=false;
                    var promise2 = new Promise(function (passed) {

                        Child.findByIdAndUpdate(childId,
                            {"$addToSet": {"events": req.body.id}},
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
                            {"$addToSet": {"registered": req.body.selectChild}},
                            {"new": true, "upsert": true},
                            function (err, managerevent) {
                                if (err) callback(err, null);
                                log += ' EventData.findByIdAndUpdate ' + managerevent + '\n';
                                passed('Event script was a success');
                            });
                    });
                    Promise.all([promise1, promise2, promise3]).then(function (value) {
                        console.log(value);
                    });
                    // item.events.push(req.body.id);
                    callback(null, log);
                }
                else{
                    Promise.all([promise1]).then(function (value) {
                        console.log(value);
                    });
                    if(registeredError)
                    {
                        console.log("NO AVAILABLE SPOTS!!!!!!");
                    }
                    if(gradeError)
                    {
                        console.log("YOU'RE CHILD AINT GETTING IN ON THIS@!#!@#!@#!");
                    }
                    callback(null,log);

                }
            }
            else{
                Promise.all([promise1]).then(function (value) {
                    console.log(value);
                });
                // item.events.push(req.body.id);
                if(registeredError)
                {
                    console.log("NO AVAILABLE SPOTS!!!!!!");
                }
                if(gradeError)
                {
                    console.log("YOU'RE CHILD AINT GETTING IN ON THIS@!#!@#!@#!");
                }
                callback(null,log);


            }

            });
    });




};
/**
@param {eventid._id} eventid
 **/
module.exports.massEventEmail = function(eventid, callback){
    var childList = [];
    var parentList = [];
    var emailList = [];
    var eventquery = new mongoose.Types.ObjectId(eventid)
    var promise1 = new Promise(function(resolve, reject){
        EventData.findOne(eventquery, function (err, currEvent) {
            if(err)
            {
                callback('failed in the event query for mass email');
                reject();
            }
            childList = currEvent.registered;
            resolve();
        });
    }).then(function () {
        var promise = new Promise(function (resolve, reject){
            Child.find({
            '_id': {$in: childList}
            }, function (err, docs) {
            if(err) callback('failed inside of child query for mass email',null);
            console.log(docs);
            for (i in docs) {
                parentList.push(docs[i]._doc.parent);
            }
            resolve();
            });
        }).then(function(){
            var promise2 = new Promise(function(resolve, reject){
                User.find({
                    '_id': {$in: parentList}
                }, function (err, docs) {
                    if(err) {
                        callback('failed inside of user query for mass email',null);
                        reject();
                    }
                    console.log(docs);
                    for (var i = 0; i < docs.length;i++) {
                        emailList.push(docs[i]._doc.email);
                    }

                    resolve();
                    callback(null,emailList);
                });
            });
        }).then(function(){

        });
    });
    callback(null,null)

};