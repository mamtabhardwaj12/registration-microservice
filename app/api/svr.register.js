/**
 * Created By :- Akshay
 * Created Date :- 29-11-2017 01:00 pm
 * Version :- 1.0.0
 */
var config = require('../../config/config.json');                       // call configration file
var _ = require('lodash');                                              // Load the full build. for manipulating objects and collections
var jwt = require('jsonwebtoken');                                      // for creating token
var bcrypt = require('bcryptjs');                                       // for hashing
var Q = require('q');                                                   // for promise 
var mongo = require('mongoskin');                                       // call mongodb    
var db = mongo.db(config.connectionString, { native_parser: true });    // mongodb connectivity
db.bind('users');                                                       // bind the collection

var service = {};

service.create = create;
service.getUser = getUser;

module.exports = service;

function create(req,res) {
    var deferred = Q.defer();
    var collectionName = req.body.appName;                              // create the collection based on appName
    console.log("whole body = ",req.body);
    db.bind(collectionName);                                            // bind the collection based on appName    
    
    db.collection(collectionName).findOne(                              // validation if user is already registered 
        { username: req.body.username },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {                                                 // username already exists                                                             
                deferred.reject('Username "' + req.body.username + '" is already taken');
            } else {
                createUser();                                           //call create user function
            }
        });

    function createUser() {
        
        var user = _.omit(req.body, 'password');                        // set user object to req.body without the cleartext password

        user.hash = bcrypt.hashSync(req.body.password, 10);             // add hashed password to user object with salt
        var collectionName = req.body.appName;                          // create the collection based on appName
        db.bind(collectionName);                                        // bind the collection based on appName

        db.collection(collectionName).insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            });
    }
    return deferred.promise;
}

function getUser(req,res) {
    var deferred = Q.defer();
    var collectionName = req.body.appName; 
    db.bind(collectionName);                                            // bind the collection based on appName    
    
    db.collection(collectionName).findOne(                              // validation if user is already registered 
        { username: req.body.username },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(user)
        });
    return deferred.promise;
}