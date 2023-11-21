const { ObjectId } = require("mongodb");
const fs = require('fs');

function readFiles(filepath) {
    let data = fs.readFileSync(filepath);
    return JSON.parse(data);
}

async function addUser(db,form) {
    let userdoc = await db.collection("user_info").insertOne({
        "name":form["name"],
        "username":form["newusername"],
        "passwd":form["createpasswd"],
        "email":form["email"],
        "sublevel":0,
        "age":parseInt(form["age"])
    });
    if (userdoc.acknowledged) {
        return {"added":true,"_id":userdoc.insertedId.toString()};
    } else {
        return {"added":false}
    }
}

async function getUserByInfo(db,username,passwd) {
    let userdoc = await db.collection("user_info").findOne({username:username,passwd:passwd});
    if (!userdoc) {
        return {"found":false}
    }
    return {_id:userdoc["_id"].toString(),"found":true};
}

async function getUserById(db,user) {
    let userdoc = await db.collection("user_info").findOne({_id : new ObjectId(user.toString())});
    if (!userdoc){
        return {"found":false};
    }
    return {username : userdoc["username"],name : userdoc["name"],"found":true};
}
// console.log(readFiles("/mediadata/scandir.json"));

module.exports = {
    getUserById:getUserById,
    readFiles:readFiles,
    addUser:addUser,
    getUserByInfo: getUserByInfo,
};