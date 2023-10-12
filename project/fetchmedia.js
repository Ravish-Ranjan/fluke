const fs = require('fs');
const authen = require('./authen.js');
const { spawn } = require('child_process');
const { log } = require('console');
const keyfile = __dirname + "/apikey.txt";
const mediafold = __dirname + "/public/media";
const scanfile = __dirname + "/mediadata/scandir.json";

function getkey() {
    const key = fs.readFileSync(keyfile);
    return key;
}

async function fetchInfo(moviename) {
    const res = await fetch(`http://www.omdbapi.com/?apikey=${getkey().toString()}&t=${moviename}`);
    const md = await res.json();
    return md
}

function scandir(){
    let parameters = [mediafold,__dirname + "/mediadata"];
    let process = spawn('python',[__dirname + "/scandir.py", ...parameters])
    return authen.readFiles(scanfile);
}

function mediaLists() {
    let res = scandir()["folders"];
    let ret = {};
    for (let i = 0; i < res.length; i++) {
        let medlist = [];
        let subfold = res[i]["folders"];
        for (let j = 0; j < subfold.length; j++) {
            medlist.push(subfold[j]["name"]);
        }
        ret[res[i]["name"]] = medlist;
    }
    return ret;
}

module.exports = {
    scandir:scandir,
    mediaLists:mediaLists,
    fetchInfo,fetchInfo
};

// fetchInfo("The Dictator").then(data => {console.log(data);});