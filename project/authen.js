const fs = require('fs');

const credfile = __dirname + "/userdata/cred.json";
const infofile = __dirname + "/userdata/info.json";

function readFiles(filepath,username) {
    let userdata = "";
    try {
        userdata = fs.readFileSync(filepath,"utf-8");
    } catch (err) {
        console.log(err);
        return null;
    }
    ret = JSON.parse(userdata);
    if (username) {
        return ret[username];
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

function searchUser(username) {
    let retcr = readFiles(credfile,username);
    if (retcr) {
        ret = readFiles(infofile,username);
        return [ret[0],ret[1],retcr];
    }
    return false;
}

function addUser(newUser){
    let check = searchUser(newUser.username);
    if (check) {
        return 1;
    }
    try {
        let udInfo = readFiles(infofile);
        udInfo[newUser.username] = [newUser.name,newUser.email];
        let inchk = writeFiles(infofile,udInfo);
        let udCred = readFiles(credfile);
        udCred[newUser.username] = newUser.passwd;
        let crchk = writeFiles(credfile,udCred);
        if ((crchk)&&(inchk)) {
            return true;
        }
        return 3;
    } catch (err) {
        return 2;
    }
}

module.exports = {
    searchUser:searchUser,
    addUser:addUser
};
// console.log(addUser(
// {
//     username:"_ravishranjan_",
//     name:"Ranjan Ravish",
//         email:"test2@gmail.com",
//         passwd:"qwerty"
//     }
// ));
