const express = require('express');
const cookieParser = require('cookie-parser');
const authen = require('./authen.js');
const { conDb,getDb } = require("./db.js")
const fetchmed = require('./fetchmedia.js');
const bodyParser = require('body-parser');
const { ObjectId, Admin } = require('mongodb');
const port = 5000;
let db;

app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.set("view engine","ejs")


app.get("/",(req,res) => {
    let user = req.cookies.uid;
    let usein = {};
    if (user) {
        authen.getUserById(db,user).then(data => {
            usein = data;
        });
        if (!(usein["found"])) {
            usein = {};
        }
    }
    let data = [];
    db.collection("quick_info").find().sort({Year:1})
    .forEach(doc => data.push(doc))
    .then(() => {
        res.render("homepage.ejs",{allInfo:JSON.stringify(data),userinfo:JSON.stringify(usein)});
    })
    .catch(() => {
        res.json({"err":"fetching error"})
    });
});

app.get("/admin@3567",(req,res) => {
    res.render("addmedia.ejs");
});

app.post("/addmedia",(req,res) => {
    let form = req.body;
    let adfold = "";
    let medfold = fetchmed.scandir() ;
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
});

app.post("/signin",(req,res) => {
    let form = req.body;
    authen.getUserByInfo(db,form["username"],form["password"]).then(data => {
        if (data["found"]) {
            res.cookie("uid",data["_id"]);
            res.status(200);
            res.redirect("/");
        } else {
            res.status(202).json({"err":"User not found :("});
        }
    });
});

app.post("/signup",(req,res) => {
    let form = req.body;
    if (form["createpasswd"] !== form["confirmpasswd"]) {
        res.status(202).json({"err":"Fields 'Create password' and 'Confirm password' are not same :("});
    } else {
        authen.getUserByInfo(db,form["newusername"],form["createpasswd"]).then(data => {
            if (!data["found"]) {
                authen.addUser(db,form).then(data => {
                    if (data["added"]) {
                        res.cookie("uid",data["_id"]);
                        res.status(200);
                        res.redirect("/");
                    } else {
                        res.status(202).json({"err":"Error adding new user :("});
                    }
                });
            } else {
                res.status(202).json({"err":"User already exists"});
            }
        });
    }
});

app.get("/getsignin",(req,res) => {
    res.render("sisu.ejs");
});

app.get("/player",async (req,res) => {
    let user = req.cookies.uid;
    if (user) {
        authen.getUserById(db,user).then(async (data) => {
            if (data["found"]) {
                let fid = req.query["fid"].toString();
                let fdoc = await db.collection("media_info").findOne({_id:new ObjectId(fid)});
                res.render("player.ejs",{data:JSON.stringify(fdoc)});
            }
            else{
                res.render("sisu.ejs")
            }
        });
    }
    else{
        res.render("sisu.ejs");
    }
});

app.get("*",(req,res) => {
    res.render("logerr.ejs")
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