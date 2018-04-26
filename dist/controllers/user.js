"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uport_1 = require("uport");
const uuid = require("uuid");
const request = require("express-validator");
class Logger {
    log(id, title, message) {
        console.log(id, title, message);
    }
}
exports.Logger = Logger;
class RESTServer {
    constructor(emailTransport, logger) {
        this.uportCache = {};
        this.emailTransport = emailTransport;
        this.logger = logger;
        this.uportCache = {};
        this.uport = new uport_1.Credentials({
            appName: 'Platform 6 Dev',
            address: '2oqDuaU6G1wwnAw7sMMAPA1vwRBibormqdJ',
            networks: {
                '0x4': {
                    registry: '0x2cc31912b2b0f3075a87b3640923d45a26cef3ee',
                    rpcUrl: 'https://rinkeby.infura.io'
                }
            },
            signer: uport_1.SimpleSigner('ec1bb76621834cfd8ea8547ad4b471d1842c1c01addfef424f1f34797c42282d')
        });
        console.log("uPort object", this.uport);
    }
    requestTokenUri(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("inside requestTokenUri");
            try {
                const id = uuid.v4();
                const requestToken = yield this.uport.createRequest({
                    requested: ['platform6'],
                    verified: ['platform6'],
                    callbackUrl: "http://localhost:3000/receiveToken?id=" + encodeURIComponent(id),
                    notifications: true
                }).catch((error) => {
                    console.log("Failed while requesting token. ", error);
                });
                console.log("===Request Token:", requestToken);
                const pollId = this.addToUPortCache(id, String(requestToken));
                res.send({
                    requestToken: requestToken,
                    pollId: pollId
                });
            }
            catch (e) {
                console.log(0, "Failed while requesting token. " + e.message, e.stack);
                this.replyRestError(500, "Failed hile requesting token. " + e.message, res);
            }
        });
    }
    ;
    postSignup(req, res, next) {
        req.assert("email", "Email is not valid").isEmail();
        const errors = req.validationErrors();
        if (errors) {
            req.flash("errors", errors);
            return res.redirect("/signup");
        }
    }
    ;
    replyRestJson(code, data, res) {
        res.writeHead(code, { 'Access-Control-Allow-Origin': '*', 'Content-type': 'application/json' });
        res.write(JSON.stringify(data));
        res.end();
    }
    replyRestError(code, message, res) {
        res.writeHead(code, { 'Access-Control-Allow-Origin': '*' });
        res.write(`Error. ${message}`);
        res.end();
    }
    addToUPortCache(id, requestToken) {
        this.gcUPortCache();
        const time = new Date().getTime() + 30 * 60 * 1000;
        this.uportCache[id] = { requestToken: requestToken, expiry: time };
        return id;
    }
    getFromUPortCache(id) {
        const entry = this.uportCache[id];
        if (!entry) {
            return void 0;
        }
        if (entry.expiry <= new Date().getTime()) {
            return void 0;
        }
        return entry;
    }
    gcUPortCache() {
        const time = new Date().getTime();
        Object.keys(this.uportCache).forEach(id => {
            const v = this.uportCache[id];
            if (v.expiry <= time) {
                delete this.uportCache[id];
            }
        });
    }
}
exports.RESTServer = RESTServer;
//# sourceMappingURL=user.js.map