
const express=require('express');
//const busboy = require('express-busboy');
//const fileUpload = require('express-fileupload');
const multer = require('multer')
const path=require('path');
const expressValidator=require('express-validator');
const bodyParser=require('body-parser');
const flash=require('connect-flash');
const session = require('express-session');
const bcrypt=require('bcrypt');

var persist = require('./persistence/persist.js');

const conn=require('./dbconn.js');
const db=new conn();
console.log("...");
db.connect((err)=>{
  if(err){
    throw err;
  }
  console.log("Mysql connected!...");
});

//db.connect((err)=>{
//  if(err){
//    throw err;
//  }
//  console.log("Mysql connected!...")
//});


const app=express();

//View Engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//static file path
app.use(express.static(path.join(__dirname,'public')));

//express file uploader
//app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));


//Define global variables
app.use((req,res,next)=>{
  res.locals.errors=null;
  next();
});


//session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(require('connect-flash')());
app.use((req,res,next)=>{
  res.locals.messages=require('express-messages')(req,res);
  next();
});
app.use(expressValidator());

//Index Routes
app.get('/',(req,res)=>{
  if(req.session.username)
  {
    req.flash('danger','User already logged in!');
    res.redirect('/dashboard');
  }
  else{
    res.render('index');
  }
});
app.get('/logout',(req,res)=>{
  if(req.session.username){
  req.session.username=null;
  console.log('Logged out');
  req.flash('success','Logged Out!');
  }
  res.render('index');
});
app.get('/dashboard',(req,res)=>{
  if(req.session.username)
  {
    var username=req.session.username;
    var sql="SELECT * FROM `user` WHERE `username`='"+username+"'";
    db.query(sql, function(err, result){
      var imagename=result[0].image;
      if(imagename===null){imagename="no-image.png";}
      res.render('dashboard',{user:result[0],date:new Date(),imagename:imagename});
    });
  }
  else{
    req.flash('danger','User Unauthorized!');
    res.redirect('/');}
});
app.get('/signup',(req,res)=>{
  if(req.session.username)
  {
    req.flash('danger','User already logged in!');
    res.redirect('/dashboard');
  }
  else{
    res.render('signup');
  }
});
app.post('/signup',(req,res)=>{
  if(req.session.username)
  {
    req.flash('danger','User already logged in!');
    res.redirect('/dashboard');
  }
  else{
    req.checkBody('username','Please enter Username!').notEmpty();
    req.checkBody('pass','Please enter Password!').notEmpty();
    req.checkBody('email','Please enter Email!').notEmpty();
    var errors=req.validationErrors();
    if(errors){
      res.render('signup',{
        errors:errors
      });
    }
    else{
      var flag=false;
      let sql1="select username from `user` where `username`='"+req.body.username+"' OR `email`='"+req.body.email+"'";
      let query1=db.query(sql1,(err,result)=>{
        if(result.length>0)
        {
          flag=true;
          console.log(flag+'--userexist'+err+'|'+result);
          req.flash('danger','User already exist!');
          res.redirect('/signup');
          return null;
        }
        else{
          if(flag===false)
          {
            console.log(flag);
          const sess=req.session;
          let user={
            username:req.body.username.trim(),
            password:req.body.pass.trim(),
            email:req.body.email.trim()
          };
          var hash=bcrypt.hashSync(req.body.pass.trim(),5);
          let sql2="insert into `user` (`username`,`password`,`email`,`created_at`,`updated_at`)values('"+req.body.username+"','"+hash+"','"+req.body.email+"',now(),now())";
          let query2=db.query(sql2,(err,result)=>{
            if(result.length>0)
            {
              console.log('insert error:'+err);
              req.flash('danger','User not signed!');
              res.render('/signup');
            }
            else{
              console.log('signed in:'+result);
              req.flash('success','User signed up! Log In now');
              res.redirect('/');
            }
          });
        }
        }
      });
    }
  }
});
app.get('/updateprofile',(req,res)=>{
  if(req.session.username)
  {
    var username=req.session.username;
    var sql="SELECT * FROM `user` WHERE `username`='"+username+"'";
    db.query(sql, function(err, result){
      var imagename=result[0].image;
      if(imagename===null){imagename="no-image.png";}
      res.render('updateprofile',{user:result[0],imagename:imagename});
    });
  }
  else{
    req.flash('danger','User Unauthorized!');
    res.redirect('/');}
});
app.post('/updateprofile',(req,res)=>{
  if(req.session.username)
  {
    //model prep in case of error
    var username=req.session.username;
    var ftype=req.body.ftype;
    var rs=null;
    var imagename="no-image.png";
    var sql="SELECT * FROM `user` WHERE `username`='"+username+"'";
    db.query(sql, function(err, result){
      imagename=result[0].image;
      rs=result;
    });
  if(ftype==="f2"){
      req.checkBody('aboutme','Please enter about me!').notEmpty();
      req.checkBody('aboutme','About me cannot exceed 140 characters!').isLength({max:140});
      var errors=req.validationErrors();
      if(errors){
        console.log(errors[0]);
        res.render('updateprofile',{user:rs,imagename:imagename,errors:errors});
      }
      else{
        sql="update `user` set `about`='"+req.body.aboutme+"' where `username`='"+username+"'";
        db.query(sql, function(err, result){
          if(err){
            req.flash('danger','Updation Unsuccessful');
            res.redirect('/dashboard');
          }
          if(result){
            req.flash('success','About me updated successfully');
            res.redirect('/dashboard');
          }
        });
      }
    }
    else{
        console.log("APP>.JS::::::::::::::");
        console.log(req);
        console.log(res);
        console.log("::::::::::::::::::::::::");
        persist.persistImage(req,res)

    }
  }
  else{
    req.flash('danger','User Unauthorized!');
    res.redirect('/');
  }

});
//Route Files
let login=require('./routes/login');
app.use('/login',login);

//Start Server
app.listen('3030',()=>{
  console.log('Server started on 3030')
});
