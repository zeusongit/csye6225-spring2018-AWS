//Set Storage engine

const multer = require('multer')
const path = require('path');

function persistToLocal(req,res){
  console.log(':::::: write functons ::::::::::');
  const storage = multer.diskStorage({
  	destination:'./public/images/upload_images/',
  	filename: function(req, file, callback) {

  		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  	}
  });
  console.log('storage: '+storage)

  //init upload
  const upload=multer({
    storage:storage,
    limits:{fileSize:1000000},
    fileFilter:function(req,file,callback){
      checkFileType(file,callback);
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
      sql="update `user` set `image`='"+req.file.filename+"' where `username`='"+username+"'";
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
});


}


module.exports.persistToLocal = persistToLocal;
