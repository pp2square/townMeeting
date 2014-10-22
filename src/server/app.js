
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');

var mongoose = require('mongoose');
var serverURI = 'localhost';
var dbName = 'townmeeting';
var dbURI = 'mongodb://' + serverURI + '/' + dbName;

var app = express();

app.configure( function () {
  // all environments
  app.set('port', process.env.PORT || 3333);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
});

//only for development mode
app.configure('development', function() {
  app.use(express.errorHandler());
});

mongoose.connect(dbURI);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'Database Connection error:'));

db.once('open', function () {
  console.log('Succeed to get conection pool in mongoose, dbURI is ' + dbURI);

  http.createServer(app).listen(app.get('port'), function(){
    console.log('MongoDB Server Starting on port ' + app.get('port'));
  });
});

db.on('disconnected', function () {
  console.log('Database connection has disconnected');
});

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Application process is going down, disconnect database connection....');
    process.exit(0);
  });
});

require('./router.js').route(app);
