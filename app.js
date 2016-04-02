var debug = require('debug')('carlsoncoder_budgetwebsiste:server');
var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//initialize config options
var configOptions = require('./config/config.js');

//mongoose
var mongoose = require('mongoose');
require('./models/Users');
require('./models/BudgetEntries');
require('./models/BudgetCategories');
require('./models/Users');
require('./models/Exceptions');

// Exception repository
var exceptionRepository = require('./services/exceptionrepository');

//passport
var passport = require('passport');
require('./config/passport');

//connect to MongoDB
var mongoConnectionString = configOptions.MONGO_DB_CONNECTION_STRING;
mongoose.connect(mongoConnectionString);

// Express setup
var app = express();

// Express view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// Enable CORS in the response headers
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// define routing for Express
var home = require('./routes/home');
var budget = require('./routes/budget');
var admin = require('./routes/admin');

app.use('/', home);
app.use('/budget', budget);
app.use('/admin', admin);

// catch 404 errors and route to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler - will print stack traces
if (process.env.NODE_ENV === 'development') {
    app.use(function(err, req, res, next) {
        logErrorToMongo(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler - no stack trace shown to user
app.use(function(err, req, res, next) {
    logErrorToMongo(err);
    res.status(err.status || 500);
    res.render('error', {
       message: err.message,
        error: {}
    });
});

function normalizePort(portValue) {
    var port = parseInt(portValue, 10);

    if (isNaN(port)) {
        // named pipe
        return portValue;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code)
    {
        case 'EACCES':
        {
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        }
        case 'EADDRINUSE':
        {
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        }
        default:
        {
            throw error;
        }
    }
}

function onListening() {
    var address = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + address : 'port ' + address.port;
    debug('Listening on ' + bind);
}

function logErrorToMongo(error) {
    console.log(error.message + '--' + error + '--' + error.stack);
    exceptionRepository.saveException(error, function(err, savedError) {
        if (err) {
            console.log('An error occurred while trying to save the error');
            console.log(err.message + '--' + err + '--' + err.stack);
        }
    });
}

// Get port from environment and store in Express */
var port = normalizePort(process.env.OPENSHIFT_NODEJS_PORT || '3000');
app.set('port', port);

var ipAddress = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
app.set('ipAddress', ipAddress);

var server = http.createServer(app);
server.listen(port, ipAddress);
server.on('error', onError);
server.on('listening', onListening);

// Final catch of any errors in the process
// Catch any uncaught errors that weren't wrapped in a try/catch statement
process.on('uncaughtException', function(err) {
    logErrorToMongo(err);
});

module.exports = app;