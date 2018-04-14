/*********************************************************
   Author: 	Renjith VR
   Version: 	1.0
   Date:	17-Feb-2018
   FileName: 	app.js
   Description:	Basic backend setup(Entry point)

**********************************************************/

// Importing Modules 
var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var cors = require('cors');
var path = require('path');
const simpleOauthModule = require('simple-oauth2');

var app = express();

const route = require('./routes/route');

mongoose.Promise = global.Promise

//Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/medJournals');
mongoose.connect('mongodb://medjournal:medjournal123@ds153958.mlab.com:53958/heroku_0s3hzt95');

//on connection
mongoose.connection.on('connected', () => {
        console.log('Connected to database mongodb @ 27017');
})

mongoose.connection.on('error', (err) => {
        if (err) {
                console.log('Error in database connection : ' + err);
        }
})

app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
});

//Adding middleware - cors
app.use(cors());

app.use(cors({
        'allowedHeaders': ['sessionId', 'Content-Type'],
        'exposedHeaders': ['sessionId'],
        'origin': '*',
        'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'preflightContinue': false
}));


//Adding body-parser
app.use(bodyparser.json());

app.set('port', (process.env.PORT || 3000));

var distDir = __dirname + '/client/dist';
app.use(express.static(distDir));


//routing
app.get('/', (req, res) => {
        res.set('Content-Type', 'text/html')
                .sendFile(path.join(__dirname + '/client/dist/index.html'));
});

//using the route
app.use('/api', route);

//binding the server with port no (callback)
app.listen(app.get('port'), function () {
        console.log('App is running, server is listening on port ', app.get('port'));
});