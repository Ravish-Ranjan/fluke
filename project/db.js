const { MongoClient } = require('mongodb');

let dbCon;

module.exports = {
    conDb: (cb) => {
        MongoClient.connect("mongodb://0.0.0.0:27017/fluke").then((cli) => {
        dbCon = cli.db();
        return cb();
    }).catch((err) => {
        console.log("Db Error");
        return cb(err)
    })
    },
    getDb: () => dbCon
}