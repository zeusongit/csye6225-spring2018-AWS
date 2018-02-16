
const express=require('express');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
//AWS.config.loadFromPath('./config.json');
//const busboy = require('express-busboy');
//const fileUpload = require('express-fileupload');
const multer = require('multer')
const path=require('path');
const expressValidator=require('express-validator');
const bodyParser=require('body-parser');
const flash=require('connect-flash');
const session = require('express-session');
const bcrypt=require('bcrypt');



const conn=require('./dbconn.js');
const db=new conn();
console.log("...");
db.connect((err)=>{
  if(err){
    throw err;
  }
  console.log("Mysql connected!...");
});

const app=express();
const s3 = new AWS.S3();
//db.connect((err)=>{
//  if(err){
//    throw err;
//  }
//  console.log("Mysql connected!...")
//});
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
else if(process.env.NODE_ENV==="dev")
{
  storage=multerS3({
    s3: s3,
    bucket: 'dummy-bucket-152',//bucketname
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
  //storage:storage,
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

//express file uploader
//app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));


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
            if(process.env.NODE_ENV==="dev")
            {
              var urlParams = {Bucket: 'dummy-bucket-152', Key: req.file.originalname + '-' + dt + path.extname(req.file.originalname)};
              s3.getSignedUrl('getObject', urlParams, function(err, url){
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

//Start Server
app.listen('3333',()=>{
  console.log('Server started on 3031')
});
