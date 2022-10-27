var express  = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app      = express();
var port     = process.env.PORT || 8081;

var passport = require('passport');
var flash    = require('connect-flash');

require('./config/passport')(passport);

app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } ));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static('./public'));
app.use(express.static('./HandleView'));

require('./app/routes.js')(app, passport);

app.listen(port);
console.log('The magic happens on port ' + port);
