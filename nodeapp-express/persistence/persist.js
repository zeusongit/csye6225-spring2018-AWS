var persistTo = require ('./writeFunctions.js');


function persistImage(req,res)
{
  switch(process.env.NODE_ENV)
  {
    case 'local':
      console.log("env is local.. persisting to local ");
      persistTo.persistToLocal(req,res);
    break;
    default:
      console.log('invalid environment');
    break;
  }


  return true;
}


module.exports.persistImage = persistImage;
