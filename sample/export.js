
function writeToLocal(name){
console.log("writing to local: "+name);

}

function writeToS3(name){
console.log("writing to S3: "+name);
}

// exports the variables and functions above so that other modules can use them 
module.exports.writeToLocal = writeToLocal;
module.exports.writeToS3 = writeToS3;
