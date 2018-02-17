var persist = require('./export');

switch(process.env.TARGET_ENV)
{
	case 'local':
		persist.writeToLocal('vikas');	
	break;
	case 'dev':
		persist.writeToS3('ashish');
	break;
	default:
		console.log("invalid target environment");
	break
}



var name = (function(){
return "vikas"})();

console.log(name);
