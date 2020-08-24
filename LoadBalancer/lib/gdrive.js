"use strict";
exports.__esModule = true;
const fs = require("fs");
const {google} = require("googleapis");
var mime = require('mime');
async function authorize(credentials, token) {
    let {client_secret, client_id, redirect_uris} = credentials.installed;
    var oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);
    return await new Promise((resolve, reject) => {
        resolve(oAuth2Client);
    });
}
async function createFolder(drive, name,parents=""){
    return await new Promise(function (resolve, reject) {
        if(parents) {
            var teamDriveFolder = {
                "name": name,
                "mimeType" : "application/vnd.google-apps.folder",
                parents: [parents]
            };
        } else {
            var teamDriveFolder = {
                "name": name,
                "mimeType" : "application/vnd.google-apps.folder"
            };
        }
        drive.files.create({
            resource: teamDriveFolder,
            supportsTeamDrives: true,
            fields : "id"
        },function(err, res) {
            if (err){
                reject(err.data);
            } else {
                resolve(res.data.id);
            }
        });
    });
}


async function upload(drive, path, folderId,name) {
    var fileMetadata = {
        name: name,
        parents: [folderId]
    };
    console.log(`Đang upload ${path}`);
    var media = {
        mimeType: mime.getType(path),
        body: fs.createReadStream(path)
    };
    return await new Promise(function(resolve, reject){
        drive.files.create({
            resource: fileMetadata,
            fields: "id",
            media: media
        },async function (err, res) {
            if (err) {
                reject("Upload error");
            } else {
                var share = await shareFile(drive,res.data.id).then(() => {
                    return false;
                }).catch(() => {
                    return true;
                });
                var check = 0;
                if(share && check < 10) {
                    console.error(`Share file lỗi, đang thử lại`);
                    share = await shareFile(drive,res.data.id).then(() => {
                        return false;
                    }).catch(() => {
                        return true;
                    });
                }
                if(!share) {
                    let link = `https://drive.google.com/file/d/${res.data.id}/view?usp=sharing`;
                    resolve({link:link,name:name});
                } else {
                    reject("Share error");
                }
            }
        });
    });
}

async function listFolder(drive) {
    return await new Promise((resolve,reject) => {
        drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
        }, (err, res) => {
            if(err) reject(err);
            resolve(res.data);
        });
    })
}

async function shareFile(drive, fileId){
    let permission = {
        type: "anyone",
        role: "reader"
    }
    return await new Promise(function(resolve, reject){
        drive.permissions.create({
            resource: permission,
            fileId: fileId,
            fields: "id",
            supportsTeamDrives: true
        }, function (err, res) {
            if (err) {
                reject(err.data);
            }
            if(res.data) {
                resolve(res.data);
            } else {
                reject("error");
            }
        });
    });
}
module.exports = {
    authorize:authorize,
    createFolder:createFolder,
    upload:upload,
    listFolder:listFolder,
    shareFile:shareFile
}