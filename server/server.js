/**
 * Created By :- Akshay
 * Created Date :- 09-11-2017 05:00 am
 * Version :- 1.0.0
 * Updated By :- Akshay
 * Updated Date :- 29-11-2017 10:00 pm
 * Version :- 1.1.0 remove login api function (here just register api)
 */
// call the packages we need
var express = require('express');                       // call express
var app = express();                                    // define our app using express
var bodyParser = require('body-parser');                // configure app to use router()
var router = express.Router();                          // get an instance of the express Router
var userService = require('./../app/api/svr.register');    // call userservice 
var config = require('./../config/config.json');           // call configration file
var port = process.env.PORT || config.port;             // set our port
var cors = require('cors');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./../docs/swagger.json'); //Path of swagger.json file in your app directory
var morgan = require('morgan');
var winston = require('./../config/winston');

// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Expose your swagger documentation through your express framework
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 

var corsOptions = {
    origin: 'http://localhost:8081',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions));

//----------Logging---------------------------------------------
app.use(morgan('combined', { stream: winston.stream }));

// error handler for logging using winston
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // add this line to include winston logging
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
    // render the error page
    res.status(err.status || 500);
    // next();
    res.send('error');
  });
//--------Logging ends----------------------------------------

router.post('/register', registerUser);                 //registration is done here (http://localhost:8080/api/register)
router.post('/getUser', getUser);                       //registration is done here (http://localhost:8080/api/getUser)

module.exports = router;

function registerUser(req, res) {
    userService.create(req,res)
    .then(function () {
        res.status(200).send('Registration Successful.');
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

function getUser(req, res) {
    userService.getUser(req,res)
    .then(function (data) {
        res.send(data);
    })
    .catch(function (err) {
        res.status(400).send(err);
    });
}

router.get('/', function (req, res) {                   //for testing the api service (http://localhost:8080/)
    res.json({ message: 'hooray! welcome to our api!' });
});

//---------------------------REGISTER OUR ROUTES ---------------------------
app.use('/api', router);                                // all of our routes will be prefixed with /api

// ================= START THE SERVER=======================================
var server = app.listen(port, function () {
    console.log('Server listening at http://localhost:' + server.address().port);
});
module.exports = server