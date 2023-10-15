const fs = require('fs');
const authen = require('./authen.js');
const { spawn } = require('child_process');
const { log } = require('console');
const keyfile = __dirname + "/apikey.txt";
const mediafold = __dirname + "/public/media";
const scanfile = __dirname + "/mediadata/scandir.json";
const mediaInfo = __dirname + "/mediadata/mediainfo.json";

function getkey() {
    const key = fs.readFileSync(keyfile);
    return key;
}

async function fetchInfo(moviename) {
    const res = await fetch(`http://www.omdbapi.com/?apikey=${getkey().toString()}&t=${moviename}`);
    const md = await res.json();
    return md;
}

function scandir(){
    let parameters = [mediafold,__dirname + "/mediadata"];
    let process = spawn('python',[__dirname + "/scandir.py", ...parameters])
    return authen.readFiles(scanfile);
}


function isSame(arr1,arr2) {
    if (arr1.lenght !== arr2.lenght) {
        return false;
    } else {
        let shorter = (arr1.length > arr2.lenght) ? arr2 : arr1;
        let longer = (shorter === arr1) ? arr2 : arr1;
        for (let i = 0; i < shorter.length; i++) {
            if (longer.includes(shorter[i])) {
                let torem = shorter[i]
                longer = longer.filter(elem => elem !== torem);
                shorter = shorter.filter(elem => elem !== torem);
                if (shorter.lenght === longer.lenght) {
                    continue;
                }
                return false;
            } else {
                return false;
            }
        }
        return true;
    }
}

function getMeta() {
    let metas = fs.readdirSync(mediafold);
    console.log(metas);
}

function subLevel(date) {
    const thisdate = new Date();
    const thatdate = new Date(date);
    let days = parseInt((thisdate - thatdate) / (1000 * 3600 * 24));
    if (days <= 60) {
        return 2;
    } else if ((days > 60) && (days <= 180)) {
        return 1;
    }
    return 0;
}

function getShort(info,filepath,type) {
    let shortInfo = {
        "filepath":filepath,
        "type":type,
        "rating":info["Rated"],
        "title":info["Title"],
        "year":info["Year"],
        "poster":info["Poster"],
        "sublevel":info["sublevel"]
    };
    authen.readFiles(mediaInfo).then(oldData => {
        oldData.push(shortInfo) ;
        authen.writeFiles(mediaInfo,oldData);
    });
}
// console.log(subLevel("29 Jul 2024"));

module.exports = {
    scandir,
    fetchInfo,
    isSame,
    getShort,
    subLevel
};


// fetchInfo("The Dictator").then(data => {console.log(data);});