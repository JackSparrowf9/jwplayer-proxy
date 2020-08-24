"use strict";
exports.__esModule = true;
var fs = require("fs");
var mime = require("mime");
var axios = require("axios");
var request = require("request");
class gapis {
    constructor(tokens,credentials,filepath,metadata,retry=3) {
        this.byteCount = 0;
        this.tokens = tokens;
        this.credentials = credentials;
        this.filepath = filepath;
        this.metadata = metadata;
        this.retry = retry;
    }
    async generateToken() {
        return await new Promise((resolve,reject) => {
            var self = this;
            var options = {
                url: "https://www.googleapis.com/oauth2/v4/token",
                method: "post",
                data: {
                    client_id: self.credentials.installed.client_id,
                    client_secret: self.credentials.installed.client_secret,
                    grant_type: "refresh_token",
                    refresh_token: self.tokens.refresh_token
                }
            }
            axios(options).then(data => {
                self.access_token = data.data.access_token;
                resolve(data.data.access_token);
            }).catch(err => {
                reject(err);
            })
        });
    }
    async createUpload() {
        return await new Promise((resolve,reject) => {
            var self = this;
            console.log(`Geting Token`);
            this.generateToken().then(access_token => {
				console.log(access_token);
                var options = {
                    method: "post",
                    url: `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsTeamDrives=true`,
                    headers: {
                        "Host": "www.googleapis.com",
                        "Authorization": `Bearer ${access_token}`,
                        "Content-Length": new Buffer(JSON.stringify(self.metadata)).length,
                        "Content-Type": "application/json",
                        "X-Upload-Content-Length": fs.statSync(self.filepath).size,
                        "X-Upload-Content-Type": mime.getType(self.filepath)
                    },
                    data: JSON.stringify(self.metadata)
                };
                axios(options).then(data => {
                    if(data.headers.location) {
                        self.location = data.headers.location;
						console.log(`Start Upload`);
                        self.send().then(data => {
                            resolve(data);
                        }).catch(err => {
                            reject({status:0,type:"error send",err:err});
                        });
                    }
                    else reject({status:0,type:"error get location"});
                }).catch(err => {
                    reject({status:0,type:"error createUpload",err:err.response.data});
                })
            }).catch(err => {
                reject({status:0,type:"error generateToken",err:err});
            })
        });
    }
    async send() {
        return await new Promise((resolve,reject) => {
            var self = this;
            var options = {
                method: "get",
                url:self.location,
                headers: {
                    "Authorization": `Bearer ${self.access_token}`,
                    "Content-Length": fs.statSync(self.filepath).size - self.byteCount,
			        "Content-Type": mime.getType(self.filepath)
                }
            }
            try {
                var uploadPipe = fs.createReadStream(self.filepath, {
                    start: self.byteCount,
                    end: fs.statSync(self.filepath).size
                });
            } catch(ex) {
                reject(ex);
            }
            var health = setInterval(function () {
                self.getProgress(function (err, res, body) {
                    if (!err && typeof res.headers.range !== "undefined") {
                        console.dir(`Uploading ${self.sizeFormat(res.headers.range.substring(8))} / ${self.sizeFormat(fs.statSync(self.filepath).size)}`);
                    }
                });
            }, 2000);
            uploadPipe.pipe(request.put(options, function (error, response, body) {
                clearInterval(health);
                if (!error) {
                    try {
                        resolve(JSON.parse(body));
                    } catch(ex) {
                        
                    }
                }
                if ((self.retry > 0) || (self.retry <= -1)) {
                    self.retry--;
                    self.getProgress(function (err, res, b) {
                        if (typeof res.headers.range !== "undefined") {
                            self.byteCount = res.headers.range.substring(8); //parse response
                        } else {
                            self.byteCount = 0;
                        }
                        self.send();
                    });
                }
            }));
        });
    }
	sizeFormat(bytes) {
		if (parseInt(bytes, 10) == 0) return "0 Byte";
		var i = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + "" + ["", "K", "M", "G", "T"][i];
	}
    getProgress(handler) {
        try {
            var self = this;
            var options = {
                uri: self.location,
                headers: {
                    "Authorization": "Bearer " + self.tokens.access_token,
                    "Content-Length": 0,
                    "Content-Range": "bytes */" + fs.statSync(self.filepath).size
                }
            };
            request.put(options, handler);
        } catch(ex) {

        }
    }
}
module.exports = gapis;