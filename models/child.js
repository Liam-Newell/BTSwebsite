var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

mongoose.connect('localhost:27017/test');

//Child schema
var childDataSchema = new Schema({
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    grade:          {type: Number, min: 1, max: 8, required: true},
    events:         [{type: Schema.Types.ObjectId, ref: 'Event'}] //an array of event ObjectID's referencing Event collection
}, {collection: 'children'});

//Instantiation of "Child" schema
var Child = module.exports = mongoose.model('Child', childDataSchema);

//"Child" related functions