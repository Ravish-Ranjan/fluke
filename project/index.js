const express = require('express');
const authen = require('./authen.js');
const fetchmed = require('./fetchmedia.js');
const bodyParser = require('body-parser');
const port = 5000;



app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set("view engine","ejs")


app.get("/",(req,res) => {
    res.render(__dirname + "/views/sisu.ejs");
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
    let scan = fetchmed.scandir();
    let addFold;
    for (const type of scan["folders"]) {
        if (type["name"] === form["media-type"]) {
            for (const fold of type["folders"]) {
                if (fetchmed.isSame(form["media-fold"],fold["files"]) && (!(fold["files"].includes("flkmeta.json")))) {
                    addFold = fold["root"];
                }
                else{
                    res.render("logerr.ejs",{err:"Media already exists"});
                }
            }
        }
    }

    let medInfo ;
    fetchmed.fetchInfo(form["media-name"]).then(data => {
        data["saved-media-path"] = addFold + form["media-file"];
        authen.writeFiles(__dirname + addFold + "flkmeta.json",data);
        res.render("logerr.ejs",{err:"Media added"});
    });
    
});

app.listen(port,() => {
    console.log(`server at http://127.0.0.1:${port}/`);
});