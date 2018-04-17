var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');


mongoose.connect('localhost:27017/test');

//Child schema
var childDataSchema = new Schema({
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    grade:          {type: Number, min: 1, max: 8, required: true},
    events:         [{type: Schema.Types.ObjectId, ref: 'Event'}], //an array of event ObjectID's referencing Event collection
    parent:         {type: Schema.Types.ObjectId, ref: 'Parent', required: true} //a single ObjectID referencing Parent id
}, {collection: 'children'});

//Instantiation of "Child" schema
var Child = module.exports = mongoose.model('Child', childDataSchema);

//"Child" related functions
/**
 * Pass in req.user
 * @param {req.session.req.user._doc} userDat should be req.session.req.user._doc
 * @callback function you want returned so async actually works (use this variable as a mean to an end so it returns)
 * should probably be req.session.req.user._doc (just saying)
**/
module.exports.listChildren = function(userDat, callback){
    var childQuery = [];
    if(userDat)
    {
        if(userDat.children.length > 0 ) {
            if (!userDat.childrenCache) {
                for (var i = 0; i < userDat.children.length; i++) {
                    var o = userDat.children[i];
                    childQuery.push(new mongoose.Types.ObjectId(o));
                }
                Child.find({
                    '_id': {$in: childQuery}
                }, function (err, docs) {
                    console.log(docs);
                    userDat.childrenCache = null;
                    userDat.childrenCache = [];
                    for (i in docs) {
                        userDat.childrenCache.push(docs[i]._doc);
                    }
                    callback(null,userDat.childrenCache);
                });
            }
            else{
                callback(null,userDat.childrenCache);
            }
        }
        else{
            callback(null,null);
        }

    }
    else{
        callback('No user was found, refer to documentation in models/child.js',null);
    }
};