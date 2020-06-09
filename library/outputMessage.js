module.exports = outputMessage;

function outputMessage(obj,msg=null) {
    if(msg){
        let outMsg = `${new Date().toISOString().replace(/T/, " ").replace(/\..+/, "")}: ${msg}`;
        console.log(outMsg, obj);
    }else{
        console.log(obj);
    }
}