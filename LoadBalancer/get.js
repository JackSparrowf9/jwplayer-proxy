const readline = require("readline");
const fs = require("fs");
var auth = require("./lib/auth");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
async function question(str) {
    return await new Promise((resolve,reject) => {
        rl.question(str, function(result) {
            resolve(result);
        });
    })
}
(async () => {
    try {
		//https://developers.google.com/drive/api/v3/quickstart/nodejs
		var path_credentials = "/root/ProxyStream/token/credentials.json";
        var credentials = JSON.parse(fs.readFileSync(path_credentials).toString());
		//var credentials = JSON.parse(await question("Input Credentials:"));
        var authLink = await auth(credentials,"generateAuth");
        console.clear();
        console.log("Copy the link to get the code");
        console.log(authLink);
        var code = await question("Input code:");
        console.clear();
        var token = await auth(credentials,"getAccessToken",code);
        console.log("Your Token:");
        console.log(token);
        var filename = await question("Name File Token:");
        fs.writeFileSync('./token/'+filename, token);
        console.log("Done generateAuth");
        process.exit(1);
    } catch(ex) {
        console.error(ex);
    }
})();