const express=require('express');
const router=express.Router();
const bcrypt=require('bcrypt');

const conn=require('../dbconn.js');
const db= conn();



router.post('/',(req,res)=>{
  req.checkBody('username','Please enter Username!').notEmpty();
  req.checkBody('pass','Please enter Password!').notEmpty();
  var errors=req.validationErrors();
  if(errors){
    res.render('index',{
      errors:errors
    });
  }
  else{
    const sess=req.session;
    let user={
      username:req.body.username.trim(),
      password:req.body.pass.trim()
    };
    let sql="select * from `user` where `username`='"+req.body.username+"'";
    let query=db.query(sql,(err,result)=>{
      if(err){ throw err;}
      if(result.length){
        if(bcrypt.compareSync(req.body.pass,result[0].password))
        {
          console.log("success");
          req.session.username=result[0].username;
          req.session.user=result[0];
          req.flash('success',result[0].username+' Logged In!');
          res.redirect('/dashboard');
        }
        else
        {
          console.log("fail");
          req.flash('danger','Invalid Credentials! Try again!');
          res.render('index');
        }
      }
      else{
        console.log("fail");
        req.flash('danger','Invalid Credentials! Try again!');
        res.render('index');
      }

    });
//var h=bcrypt.hashSync('ashish',5);
  //  let sql2="insert into `user` (`id`,`username`,`password`,`created_at`,`updated_at`)values(3,'ashish','"+h+"',now(),now())";
    //let query2=db.query(sql2,(err,result)=>{
      //console.log('done'+err);
  //  });
  }
});


module.exports=router;
