const fs = require('fs');
const { spawn } = require('child-process');
const keyfile = __dirname + "/apikey.txt";
const mediafold = __dirname + "/public/media"
const dirscan = __dirname + "/dirscan.json"

function getkey() {
    const key = fs.readFileSync(keyfile);
    return key;
}

async function fetchInfo(moviename) {
    const res = await fetch(`http://www.omdbapi.com/?apikey=${getkey().toString()}&t=${moviename}`);
    const md = await res.json();
    console.log(md);
}
