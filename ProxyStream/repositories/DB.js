"use strict";
exports.__esModule = true;
/**
 * Created by nam on 5/27/2017.
 */
var DB = (function () {
    function DB() {
    }
    DB.setNewLinkPlaysToDB = function (ip, driveId, data) {
        return DB.mapFileIdWithRequestInfo.set(key, value);
    };
    DB.getLinksData = function (ip, driveId) {
        return DB.mapFileIdWithRequestInfo.get(key);
    };
    DB.setHashData = function (hash, ip, link, cookies) {
        DB.mapHashData.set(hash, { ip: ip, link: link, cookies: cookies });
    };
    DB.getHashData = function (hash) {
        return DB.mapHashData.get(hash);
    };
    return DB;
}());
DB.mapDriveIdToGoogleLinks = new Map();
DB.mapIpAndDriveIdToOurLinks = new Map();
DB.mapOurLinkToGoogleData = new Map();
DB.mapFileIdWithRequestInfo = new Map();
DB.mapHashData = new Map();
DB.mapDriveIdLinkPlays = new Map();
exports.DB = DB;
