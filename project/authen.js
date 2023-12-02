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
    return {username : userdoc["username"],name : userdoc["name"],age:userdoc["age"],"found":true};
}
// console.log(readFiles("/mediadata/scandir.json"));

const agemap = {
    "R":18,
    "Approved":0,
    "PG-13":13,
    "Not Rated":0,
    "NC-17":17,
    "X":21,
    "A":18
}
const agemsg = "Please be aware that the movie you are about to watch is not recommended for your age group."+
    " This movie may contain mature content, such as violence, language, or sexual content,"+
    " that may be disturbing or inappropriate for viewers at your age.";

function getagemsg(age,rating) {
    return (agemap[rating] > age) ? agemsg : "";
}

module.exports = {
    getUserById:getUserById,
    readFiles:readFiles,
    addUser:addUser,
    getUserByInfo: getUserByInfo,
    getagemsg: getagemsg,
};