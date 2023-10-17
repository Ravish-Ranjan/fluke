const fs = require('fs');

const credfile = __dirname + "/userdata/cred.json";
const infofile = __dirname + "/userdata/info.json";

async function readFiles(filepath,key) {
    let userdata = "";
    try {
        userdata = await fs.readFileSync(filepath,"utf-8");
    } catch (err) {
        console.log(err);
        return null;
    }
    ret = JSON.parse(userdata);
    if (key) {
        return ret[key];
    }
    return ret;
}

function writeFiles(filepath,data) {
    try {
        fs.writeFileSync(filepath,JSON.stringify(data,null,4));
    } catch (err) {
        console.log(err);
        return false;
    }
    return true;
}
module.exports = {
    readFiles:readFiles,
    writeFiles:writeFiles
};
// console.log(addUser(
// {
//     username:"_ravishranjan_",
//     name:"Ranjan Ravish",
//         email:"test2@gmail.com",
//         passwd:"qwerty"
//     }
// ));
