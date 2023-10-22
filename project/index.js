const express = require('express');
const authen = require('./authen.js');
const { conDb,getDb } = require("./db.js")
const fetchmed = require('./fetchmedia.js');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const port = 5000;
let db;

app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set("view engine","ejs")


app.get("/",(req,res) => {
    let data = [];
    db.collection("quick_info").find().sort({Year:1})
    .forEach(doc => data.push(doc))
    .then(() => {
        // res.json(data)
        res.render("homepage.ejs",{allInfo:JSON.stringify(data),name:" "});
    })
    .catch(() => {
        res.json({"err":"fetching error"})
    });
});

app.post("/signin",(req,res) => {
    let form = req.body;
    let result = authen.searchUser(form.username);
    if (result) {
        if (result[2] === form.password) {
            res.render("homepage.ejs",{name:result[0]})
        }
        else{
            res.render("logerr.ejs",{err:"Password or Username doesn't match"});
        }
    } else {
        res.render("logerr.ejs",{err:"No such user found"})
    }
});

app.post("/signup",(req,res) => {
    let form = req.body;
    if (form.createpasswd !== form.confirmpasswd) {
        res.render("logerr.ejs",{err:"Create password and confirm password field doesn't match"});
    }
    else{
        let result = authen.addUser({
            username:form.newusername,
            name:form.fullname,
            email:form.email,
            passwd:form.createpasswd
        });
        if (result === true) {
            res.render("homepage.ejs",{name:form.fullname});
        } else if (result === 1) {
            res.render(__dirname + "logerr",{err:"User alredy exists"});
        } else if (result === 2) {
            res.render(__dirname + "logerr",{err:"Invalid Input"});
        } else if (result === 3) {
            res.render(__dirname + "logerr",{err:"Error While adding user"});
        }
    }
});

app.get("/admin@3567",(req,res) => {
    res.render("addmedia.ejs");
});

app.post("/addmedia",(req,res) => {
    let form = req.body;
    let adfold = "";
    fetchmed.scandir().then(medfold => {
        for (const typefold of medfold["folders"]) {
            if (typefold["name"] === form["media-type"]) {
                for (const medfile of typefold["folders"]) {
                    if (fetchmed.isSame(medfile["files"],form["media-fold"])) {
                        adfold = medfile["root"];
                    }
                }
            }
        }
        fetchmed.fetchInfo(form["media-name"]).then(async data => {
            data["foldpath"] = adfold;
            data["filepath"] = form["media-fold"];
            data["sublevel"] = parseInt(fetchmed.subLevel(data["Released"]));
            const mef_if = await db.collection("media_info").insertOne(data);
            const mef_if_id = mef_if.insertedId;

            let shortInfo = fetchmed.getShort(data, mef_if_id,form["media-type"]);
            const sh_if = await db.collection("quick_info").insertOne(shortInfo);
            res.render("logerr.ejs",{err:"media-added"})
        });
    })
});

app.get("/player",async (req,res) => {
    let fid = req.query["fid"].toString();
    let fdoc = await db.collection("media_info").findOne({_id:new ObjectId(fid)});
    res.render("player.ejs",{data:JSON.stringify(fdoc)});
});

conDb((err) => {
    if (!err) {
        app.listen(port,() => {
            console.log("Database connected...");
            console.log(`Server starting at http://127.0.0.1:${port}/`);
        });
        db = getDb();
    }else{
        console.log("Error conneecting to the database !");
    }
})