var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
const auth =require('./routes/auth');
var hbs=require('express-handlebars');
const Handlebars = require('handlebars');
const expressHandlebars=require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const verifytokenAndAuthorization= require('./controller/verifyToken');
const verifytokenadmin=require('./controller/verifyTokenAdmin');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');
// view engine setup
app.engine('hbs', hbs.engine({ handlebars: allowInsecurePrototypeAccess(Handlebars) ,defaultLayout: 'layout',layoutsDir:__dirname+'/views/layout/', extname: 'hbs',helpers:{
  formator:function (date){
    date=String(date)
    return date.slice(4,16)
  
  },
  pending:function(status){
    if(status== 'pending'){
      return true
    }else{
      return false
    }
  },
  shipped:function(status){
    if(status== 'shipped'){
      return true
    }else{
      return false
    }
  },
  delivered:function(status){
    if(status== 'delivered'){
      return true
    }else{
      return false
    }
  },
  cancelOd:function(status){
    if(status== 'Cancelled'){
      return true
    }else{
      return false
    }
  }
}}));
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
// app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
app.use('/',auth)
app.use('/admin',adminRouter);
app.use('/',usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
