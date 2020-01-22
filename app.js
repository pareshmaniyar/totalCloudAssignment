var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const csv = require('csv-parser');
const fs = require('fs');
let timetable = {};
let english = [];
let classes = ["10th","9th","8th","7th","6th"];
let days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
let files = ["English", "Hindi", "Kannada", "Maths", "Science"];
for(let i = 0; i < 5; i++){
  timetable[classes[i]] = {};
  for(let j = 0;j < 6;j++){
    timetable[classes[i]][days[j]] = [];
    for(let k = 0; k < 9; k++){
      timetable[classes[i]][days[j]].push(null);
    }
  }
}
console.log(timetable);
files.forEach((val) => {
fs.createReadStream(val + '.csv')
  .pipe(csv())
  .on('data', (row) => {
    let classTime = 0;
    if((row['--'].charAt(1)) != ':'){
      classTime = parseInt(row['--'].substring(0,2)) - 8;
    } else {
      classTime = parseInt(row['--'].substring(0,1)) - 8;
      if(classTime < 0) {
        classTime = parseInt(row['--'].substring(0,1)) + 4;
      }
    }
    for(let [key, value] of Object.entries(row)) {
      if(value != '' && key != "--"){
        // try {
          timetable[value.trim()][key][classTime] = val;
        // } catch(e){
        //   console.log("Error: value "+ value + ", key: " + key + ", classTime: " + classTime + ", Sub: " + val);
        //   console.log(timetable[value]);
        // }
      }
    }
    english.push(row);
    console.log(row);
  })
  .on('end', () => {
    // console.log(english);
    console.log(timetable);
    console.log('CSV file successfully processed');
  });
});

// var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){ 
  res.render('index',{title:"Express", timetable}) 
}); 
// app.use('/', indexRouter, timetable);
app.use('/users', usersRouter);

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
