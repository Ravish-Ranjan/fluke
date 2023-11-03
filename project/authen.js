const { ObjectId } = require("mongodb");

async function addUser(db,form) {
    
}

async function getUserByUserName(db,username) {
    let userdoc = await db.collection("user_info").findOne({username : username});
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

module.exports = {
    getUserById:getUserById,
    addUser:addUser,
    getUserByUserName,getUserByUserName
};