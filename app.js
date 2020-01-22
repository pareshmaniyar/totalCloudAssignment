var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const csv = require('csv-parser');
const fs = require('fs');
let timetable = {};
let teacherSchedule = {};
let english = [];
//Can generaize below code
let classes = ["10th","9th","8th","7th","6th", "5th"];
let days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
let files = ["English", "Hindi", "Kannada", "Maths", "Science"];
let teachers = ["Teacher 1", "Teacher 2", "Teacher 3", "Teacher 4", "Teacher 5", "Teacher 6"];

for(let i = 0; i < classes.length; i++){
  timetable[classes[i]] = {};
  for(let j = 0;j < days.length;j++){
    timetable[classes[i]][days[j]] = [];
    for(let k = 0; k < 9; k++){
      timetable[classes[i]][days[j]].push(null);
    }
  }
}
for(let i = 0; i < files.length; i++){
  teacherSchedule[files[i]] = {};
  for(let j = 0;j < days.length;j++){
    teacherSchedule[files[i]][days[j]] = [];
    for(let k = 0; k < 9; k++){
      teacherSchedule[files[i]][days[j]].push(null);
    }
  }
}
console.log(timetable);
files.forEach((Subject) => {
fs.createReadStream(Subject + '.csv')
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
        try {
          timetable[value.trim()][key][classTime] = Subject;
          teacherSchedule[Subject][key][classTime] = value.trim();
        } catch(e){
          console.log("Error: value "+ value + ", key: " + key + ", classTime: " + classTime + ", Sub: " + Subject);
        }
      }
    }
    english.push(row);
    console.log(row);
  })
  .on('end', () => {
    console.log(english);
    console.log(timetable);
    //Assigning Teachers each Subject
    let counter = 1;
    console.log("Entered/////////////////////////////////////////////////////");
    for(let eachClass of Object.keys(timetable)) {
      for(let day of Object.keys(timetable[eachClass])) {
        console.log("day ",day);
        timetable[eachClass][day].forEach((timeSlot, index) => {
          // console.log("eachClass "+ eachClass + ", day: " + day + ", index: " + index + ", timeSlot: " + timeSlot + ", val: " + timetable[eachClass][day]);
          if(!timeSlot){
            console.log("Null *********************&&&&&&&&&&&&&&&&&&&&&&&&&&&***************");
            // console.log("otherClass "+ otherClass + ", day: " + day + ", index: " + index + ", timeSlot: " + timeSlot + ", val: " + timetable[eachClass][day]);
            //check for availability of other teachers
            let newTeachersList = {};
            files.forEach((teacher) => {
              newTeachersList[teacher] = true;
            });
            for(let otherClass of Object.keys(timetable)) {
              console.log("otherClass "+ otherClass + ", day: " + day + ", index: " + index + ", timeSlot: " + timeSlot + ", val: " + timetable[eachClass][day]);
              if(newTeachersList.hasOwnProperty(timetable[otherClass][day][index])){
                delete newTeachersList[timetable[otherClass][day][index]];
              }
            }
            if(Object.keys(newTeachersList).length === 0 && newTeachersList.constructor === Object){
              console.log("/////////////////////////////////////////////////////////////////");
              timetable[eachClass][day][index] = ("Teacher " + counter);
              files.push("Teacher " + counter);
              counter = counter + 1;
            } else {
              timetable[eachClass][day][index] = Object.keys(newTeachersList)[0];
              console.log("Object.keys(newTeachersList)[0]: ", Object.keys(newTeachersList)[0], ", day:", day, ", index:", index, ", eachClass: ", eachClass);
              if(!teacherSchedule.hasOwnProperty(Object.keys(newTeachersList)[0])){
                console.log("!!!!!!!!!!!!!!inside");
                teacherSchedule[Object.keys(newTeachersList)[0]] = {};
                for(let j = 0;j < 6;j++){
                  teacherSchedule[Object.keys(newTeachersList)[0]][days[j]] = [];
                  for(let k = 0; k < 9; k++){
                    teacherSchedule[Object.keys(newTeachersList)[0]][days[j]].push(null);
                  }
                }
              }
              // console.log(teacherSchedule);
              teacherSchedule[Object.keys(newTeachersList)[0]][day][index] = eachClass + "Updated";
            }
          }
        })
      }
    }
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
  res.render('index',{title:"Express", timetable, teacherSchedule}) 
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
