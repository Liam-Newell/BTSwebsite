//ADD-ONS SECTION

//Require statments to include proper funtionality
var express = require('express');

var asserts = require('asserts');
var assert = require('assert');

var router = express.Router();

//For mongoDB
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/test');
var Schema = mongoose.Schema;

//For sessions
var expressSession = require('express-session');
router.use(expressSession({secret: 'max', saveUninitialized: false, resave: false}));



//DATABASE SECTION

//Database Schema : USER
var userDataSchema = new Schema({
    username:       {type: String, required: true},
    password:       {type: String, required: true},
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    streetaddress:  {type: String, required: false},
    email:          {type: String, required: false},
    phonenumber:    {type: String, required: false},
    phonenumber2:   {type: String, required: false},
    isAdmin:        {type: Boolean, required: true},
    birthday:       {type: Date, required: false},
    children:       [{type: Schema.Types.ObjectId, ref: 'Child'}], //an array of child ObjectID's referencing Child collection
    events:         [{type: Schema.Types.ObjectId, ref: 'Event'}] //an array of event ObjectID's referencing Event collection
    }, {collection: 'data'});

//Database Schema : CHILD
var childDataSchema = new Schema({
    firstname:      {type: String, required: true},
    lastname:       {type: String, required: true},
    birthday:       {type: Date, required: true},
    grade:          {type: Number, min: 1, max: 8, required: true},
    events:         [{type: Schema.Types.ObjectId, ref: 'Event'}] //an array of event ObjectID's referencing Event collection
    }, {collection: 'children'});

//Instantiate Schema as Models: User, Child
var User = mongoose.model('User', userDataSchema);
var Child = mongoose.model('Child', childDataSchema);



//ROUTER SECTION

//GETTERS

//Get: log-in page (index.hbs)
router.get('/', function(req, res, next) {

    res.render('index', {
        title: 'Church Centre' ,
        success: false,
        errors: req.session.errors
    });

    req.session.errors = null;

});

//Get: account page (account.hbs)
router.get('/account', function (req, res, next) {
    var sess = req.session;
    var userData = sess.userDat;

    if(sess.logged) {
        var bday = new Date (userData.birthday).toUTCString();
        console.log(bday);

        res.render('account', {
            user: sess.username,
            title: 'Church Centre',
            firstname: userData.firstname,
            lastname: userData.lastname,
            dob: bday,
            email: userData.email,
            ph1: userData.phonenumber,
            ph2: userData.phonenumber2
        });

    }else{
        res.redirect('localhost:3000')
    }
});

//Get: register page (register.hbs)
router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Church Centre'});
});

//Get: registerchild page (registerchild.hbs)
router.get('/registerchild', function (req, res, next) {
    var sess = req.session;
    var userData = sess.userDat;

    if(sess.logged) {

        res.render('registerchild', {
            user: userData.username
        });

    }else{
        res.render('index', {title: 'Church Centre'});
    }
});

//Get: homepage (homepage2.hbs)
router.get('/homepage2', function (req, res, next) {

    var userInfo = req.session;

    if(userInfo.logged){

        res.render('homepage2', {
            user: userInfo.username,
            title: 'Church Centre'
        });

    }else{
        res.redirect('/');
    }

});

//Get: database page (database.hbs)
router.get('/get-data', function (req, res, next) {

    User.find()
        .populate('children')
        .then(function(doc){
            if(doc.length > 0) {

                res.render('database', {
                    items: doc
                });

            }else{
                res.render('index', {title: "database empty!!"});
            }
        });

});

//Get: sign-out sequence
router.get('/sign-out', function(req, res, next) {

    var sess = req.session;
    var userData = sess.userDat;

    if(sess.logged){
        req.session.destroy(function (err) {

            if (err) {
                console.log(err);
            } else {
                res.redirect('/');
            }

        });

    }else{
        res.redirect('/')
    }
});


//POSTS

//Post: register page (register.hbs)
router.post('/register', function (req, res, next){

    var item = {
        username: req.body.username,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        streetaddress: req.body.streetaddress,
        email: req.body.email,
        phonenumber: req.body.phonenumber,
        phonenumber2: req.body.phonenumber2,
        isAdmin: req.body.isAdmin || false,
        birthday: req.body.birthday,
        children: [],
        events: []
    };

    req.check('lastname', 'Invalid last name').isLength({min:2});
    req.check('firstname','Invalid first name').isLength({min:2});

    var errors = req.validationErrors();

    if(!errors){
        var data = new User(item);
        data.save();

        //Logging in new user - temp fix  || S.N.
        var sessData = req.session;
        sessData.logged = true;
        sessData.username = item.username;
        sessData.userDat = item;
        console.log(sessData.userDat.email);

        res.redirect('/homepage2');

    }else{

        res.render('register', {
            title: 'Incorrect Values',
            success: false,
            errors: req.session.errors
        });

    }
});

//Get: childList page (childList.hbs)
router.get('/childList', function (req, res, next) {

    //var monthpassed = req.query.id;
    var childQuery = [];
    var children = [];
    var userDat = req.session;

    //LIST OF CHILDREN CAN ONLY BE ACCESSED IF LOGGED IN - Crashes when this if statement is not in place. S.N.
    if(userDat.logged)
    {
        if(req.session.userDat.children.length > 0 ) {
            if (!req.session.childrenCache) {
                for (var i = 0; i < req.session.userDat.children.length; i++) {
                    var o = req.session.userDat.children[i];
                    childQuery.push(new mongoose.Types.ObjectId(o));
                }
                Child.find({
                    '_id': {$in: childQuery}
                }, function (err, docs) {
                    console.log(docs);
                    req.session.childrenCache = null;
                    req.session.childrenCache = [];
                    for (i in docs) {
                        req.session.childrenCache.push(docs[i]._doc);
                    }
                    res.render('childList', {
                        childList: req.session.childrenCache,
                        user: userDat.username,
                        title: "Registered Children | Church Centre"
                    });
                });
            }else {
                res.render('childList', {childList: req.session.childrenCache, user: userDat.username, title: "Registered Children | Church Centre"});
            }
        }
        else{
            res.render('childList', {user: userDat.username, title: "Registered Children | Church Centre"});
        }



    }
    else
    {
        res.redirect('/');
    }

});
//Post: register child (registerchild.hbs).
router.post('/registerchild', function (req, res, next) {
    var userData = req.session.userDat;
    var sess = req.session;

    var item = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        birthday: req.body.birthday,
        grade: req.body.grade
    };

    if(sess.logged){

            req.check('lastname', 'Invalid last name').isLength({min: 2});
            req.check('firstname', 'Invalid first name').isLength({min: 4});

            var errors = req.validationErrors();
            if(req.session.childrenCache){
                req.session.childrenCache = null;
            }
            if (!errors) {
                var data = new Child(item);
                var cid = data._id;
                data.save();
                var userItem = req.session.userDat;
                User.findByIdAndUpdate(userItem._id,
                    {$push: {children: cid}},
                    {new : true}, function (err, childreg){
                        if (err) throw err;
                        console.log(childreg);
                        //data.save();
                        req.session.userDat.children.push(data._id.toString('hex'));
                        res.redirect('/childList');
                }

                );

            }
            else {

                res.render('registerchild'),{
                    title: 'Incorrect Values',
                    cuck: 'Ya messed up',
                    success: false,
                    errors: req.session.errors

                }
            }
    }
});
//Remove Child from the account
router.get('/deletechild/:id', function (req, res, next) {
    var childID = encodeURIComponent(req.params.id);
    var search = new mongoose.Types.ObjectId(childID);
    var found = false;
    var userData = req.session.userDat;
    var sess = req.session;
    //get Child ID
    if(sess.logged)
    {
        if(req.session.childrenCache){
            req.session.childrenCache = null;
        }
            //Remove Link to User Account as well
        Child.findByIdAndRemove(childID, (err, child) => {
                if (err) throw err;
                console.log(child);
            });
        User.findById(userData._id, function (err, user) {
            if (err) throw err;
            var search = new mongoose.Types.ObjectId(childID);
            for(var i = 0;i < user._doc.children.length; i++){
                if(user._doc.children[i].id.toString('hex') === search.id.toString('hex')){
                    user._doc.children.splice(i, 1);
                }
            }
            user.save(function (err) {
                if (err) throw err;
                console.log(user);
                res.redirect('/childList');
            });
            // User.findByIdAndRemove(childID);
            //Remove Child from database


        });



    }
    else
    {
        res.redirect('/');
    }
});
//Post: login sequence (index.html)
router.post('/login', function(req, res, next) {
    //form validation etc
    var item = {
        username: req.body.username,
        password: req.body.password
    };

    User.find({username : item.username, password : item.password}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');

            res.render('login',{
                title: 'First last name combo doesnt exist',
                cuck: 'Ya messed up',
                success: false, errors: req.session.errors
            });

        }else{

            var sessData = req.session;
            if (sessData.logged)
                req.session.destroy(function (err) {
                    if (err)
                        console.log(err);
                });
            sessData.logged = true;
            sessData.username = doc[0].username;
            sessData.userDat = doc[0]._doc;
            console.log(sessData.userDat.email);
            //res.render('homepage2', {user: sessData.username, a: doc[0]._doc.username, b: doc[0]._doc.password, resultlist: doc[0]._doc._id});
            res.redirect('/homepage2');
        }
    });
});

//Post: '/submit' is identicial to in the index.hbs file
router.post('/index', function(req, res, next) {
    //form validation etc
    var item = {
        username: req.body.username,
        password: req.body.password
    };
    User.find({username : item.username, password : item.password}).then(function(doc){
        if(doc < 1){
            console.error('no login exists');
            res.render('index', {
                title: 'First last name combo doesnt exist', cuck: 'Ya messed up'
                , success: false, errors: req.session.errors
            });
        }
        else {

            res.render('homepage2', {a: doc[0]._doc.username, b: doc[0]._doc.password, resultlist: doc[0]._doc._id});
        }
    });
});




module.exports.userDataSchema = userDataSchema;
module.exports = mongoose.model("User", userDataSchema);
module.exports.User = User;
module.exports = mongoose.model("Child", childDataSchema);
module.exports = expressSession();
module.exports = router;
