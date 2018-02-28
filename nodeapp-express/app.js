
const de=require('dotenv').load();// Lets us set environment variable define in .env file on root dir
const express=require('express');// Loads the web application framework
const AWS = require('aws-sdk');// Lets us interact with the aws services
const multerS3 = require('multer-s3');// Lets us interact with the S3 Bucket for multipart forms upload
const multer = require('multer')// Lets us interact with multipart forms upload
const path=require('path');// Lets us manipulate/use paths
const expressValidator=require('express-validator');// Used to validate forms from request.body
const bodyParser=require('body-parser');// Used to parse form data
const flash=require('connect-flash');// Lets us display flash messages for notifications/errors (async)
const session = require('express-session');// loads session functionality compatible with express
const bcrypt=require('bcrypt');// for hashing



const conn=require('./dbconn.js');//DB connection file
const db=new conn();
console.log("...");
db.connect((err)=>{
  if(err){
    throw err;
  }
  db.query('CREATE DATABASE IF NOT EXISTS '+process.env.DB_NAME, function (err) {// create db if not exist
    if (err) throw err;
    db.query('USE '+process.env.DB_NAME, function (err) {
      if (err) throw err;
      db.query('create table IF NOT EXISTS user('
        + 'user_id INT NOT NULL AUTO_INCREMENT,'
        + 'username VARCHAR(100) NOT NULL,'
        + 'password VARCHAR(100) NOT NULL,'
        + 'email VARCHAR(100) NOT NULL,'
        + 'about VARCHAR(150),'
        + 'image varchar(255),'
        + 'created_at DATE,'
        + 'updated_at DATE,'
        + 'PRIMARY KEY ( user_id )'
        +  ')', function (err) {
            if (err) throw err;
      });
    });
  });
  console.log("Mysql connected!...");
});

const app=express();
const s3 = new AWS.S3();

//Set Storage engine
const dt=Date.now();
var storage=null;
const uploadDir="images/upload_images/";
if(process.env.NODE_ENV==="local")
{
   storage = multer.diskStorage({
  	destination:'./public/'+uploadDir,
  	filename: function(req, file, callback) {
  		callback(null, file.originalname + '-' + dt + path.extname(file.originalname))
  	}
  });
}
else if(process.env.NODE_ENV==="development")
{
  storage=multerS3({
    s3: s3,
    bucket: process.env.BUCKET,//bucketname
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});//fieldname
    },
    key: function (req, file, cb) {
      cb(null, file.originalname + '-' + dt + path.extname(file.originalname))//uploaded file name after upload
    }
  });
}
else{console.log("3");}
//init upload
const upload=multer({
  storage:storage,
  limits:{fileSize:1000000},
  fileFilter:function(req,file,callback){
    checkFileType(file,callback);
    console.log(file);
  }
}).single('fileupload');

function checkFileType(file,callback){
  const fileTypes=/jpeg|jpg|png|gif/;
  const extName=fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType=fileTypes.test(file.mimetype);
  if(mimeType && extName){
    return callback(null,true);
  } else{
    callback('Error: Images Only');
  }
}



//View Engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//static file path
app.use(express.static(path.join(__dirname,'public')));


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
//Define global variables
app.use((req,res,next)=>{
  res.locals.errors=null;
  res.locals.userCheck = req.session.username;
  res.locals.accessSource = null;
  next();
});

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
      if(imagename===null){imagename=uploadDir+"no-image.png";}
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
      if(imagename===null){imagename=uploadDir+"no-image.png";}
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
    console.log(ftype);
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
    else if(ftype==="f3"){
      if(process.env.NODE_ENV==="development")
      {
        var sql="SELECT `image` FROM `user` WHERE `username`='"+username+"'";
        db.query(sql, function(err, result){
          if(err)
          {
            console.log("sql0 error:"+err);
            req.flash('danger','Updation Unsuccessful');
            res.redirect('/dashboard');
          }
          else{
            imagename=(result[0].image).replace('https://s3.amazonaws.com/'+process.env.BUCKET +'/', '');
            s3.deleteObject({
              Bucket: process.env.BUCKET,
              Key: imagename
            },function (err,data){
              if(err){
                console.log("s3 error"+err);
                req.flash('danger','Updation Unsuccessful');
                res.redirect('/dashboard');
              }
              if(data){
                console.log("DELETED:"+data);
                var sql="update `user` set `image`=NULL where `username`='"+username+"'";
                db.query(sql, function(err, result){
                  if(err){
                    console.log("sql1 error"+err);
                    req.flash('danger','Updation Unsuccessful');
                    res.redirect('/dashboard');
                  }
                  if(result){
                    req.flash('success','Profile picture removed successfully');
                    res.redirect('/dashboard');
                  }
                  else{
                    console.log("sql2 error"+err);
                    req.flash('danger','Updation Unsuccessful');
                    res.redirect('/dashboard');
                  }
                });
              }
            });
          }
        });
      }
      else if(process.env.NODE_ENV==="local")
      {
        console.log(req.file.originalname + '-' + dt + path.extname(req.file.originalname));
        var sql="update `user` set `image`=NULL where `username`='"+username+"'";
        db.query(sql, function(err, result){
          if(err){
            req.flash('danger','Updation Unsuccessful');
            res.redirect('/dashboard');
          }
          if(result){
            req.flash('success','Profile picture removed successfully');
            res.redirect('/dashboard');
          }
        });
      }
    }
    else{
        upload(req,res,(err)=>{
        if(err){
          req.flash('danger','Only images with .jpeg/.png/.gif formats are allowed!');
          res.redirect('/updateprofile');
          console.log("error in upload");
        }
        else{
          if(req.file===undefined){
            req.flash('danger','Select an image to upload');
            res.redirect('/updateprofile');
            console.log("no image selected");
          }
          else{
            if(process.env.NODE_ENV==="development")
            {
              var url = 'https://s3.amazonaws.com/'+process.env.BUCKET +'/'+ req.file.originalname + '-' + dt + path.extname(req.file.originalname);
              var sql="update `user` set `image`='"+url+"' where `username`='"+username+"'";
              db.query(sql, function(err, result){
                if(err){
                  req.flash('danger','Updation Unsuccessful');
                  res.redirect('/dashboard');
                }
                if(result){
                  req.flash('success','Profile picture updated successfully');
                  res.redirect('/dashboard');
                }
              });
            }
            else if(process.env.NODE_ENV==="local")
            {
              console.log(req.file.originalname + '-' + dt + path.extname(req.file.originalname));
              var u_image=uploadDir + req.file.originalname + '-' + dt + path.extname(req.file.originalname);
              var sql="update `user` set `image`='"+u_image+"' where `username`='"+username+"'";
              db.query(sql, function(err, result){
                if(err){
                  req.flash('danger','Updation Unsuccessful');
                  res.redirect('/dashboard');
                }
                if(result){
                  req.flash('success','Profile picture updated successfully');
                  res.redirect('/dashboard');
                }
              });
            }
          }
        }
      });
    }
  }
  else{
    req.flash('danger','User Unauthorized!');
    res.redirect('/');
  }

});

app.get('/profile/:username',(req,res)=>{
  var username = req.params.username;
  if(username)
  {
    var sql="SELECT * FROM `user` WHERE `username`='"+username+"'";
    db.query(sql, function(err, result){
      var imagename=result[0].image;
      if(imagename===null){imagename=uploadDir+"no-image.png";}
      res.render('dashboard',{user:result[0],date:new Date(),imagename:imagename,accessSource:"public"});
    });
  }
  else{
    req.flash('danger','Request denied!');
    res.redirect('/');
  }
});

//Route Files
let login=require('./routes/login');
app.use('/login',login);

PORT='3000';
//Start Server
app.listen(PORT,()=>{
  console.log('Server started on '+PORT)
});

app.use(function(req, res, next){
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('404', { url: req.url });
    return;
  }
  //res.type('txt').send('Not found');
});
