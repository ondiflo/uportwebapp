import * as nodemailer from "nodemailer"
import { Request, Response, NextFunction } from "express"
import { Credentials, SimpleSigner, Token } from "uport"
import * as uuid from 'uuid'
import * as util from 'util'
import * as http2 from "http2"
import * as fs from "fs"
import * as url from 'url'
import * as qrcode from 'qrcode'

const request = require("express-validator");

type CacheEntry = {
    requestToken: string,
    expiry: number,
    responseToken?: Token,
    needEmail?: boolean,
    error?: string
}

export class Logger {
    public log(id: number, title: string, message: string) {
        console.log(id, title, message);
    }
}

export class RESTServer {
    private emailTransport: nodemailer.Transporter;
    private logger: Logger;
    private uport: Credentials;
    private uportCache: { [id: string]: CacheEntry } = {}

    constructor(emailTransport: nodemailer.Transporter, logger: Logger) {
        this.emailTransport = emailTransport
        this.logger = logger
        this.uportCache = {}
        this.uport = new Credentials(
            {
                appName: 'Platform 6 Dev',
                address: '2oqDuaU6G1wwnAw7sMMAPA1vwRBibormqdJ',
                networks: {
                    '0x4': {
                        registry: '0x2cc31912b2b0f3075a87b3640923d45a26cef3ee',
                        rpcUrl: 'https://rinkeby.infura.io'
                    }
                },
                signer: SimpleSigner('ec1bb76621834cfd8ea8547ad4b471d1842c1c01addfef424f1f34797c42282d')
            }
        );
        console.log("uPort object", this.uport);
    }
    
    public async requestTokenUri(req: Request, res: Response) {

        console.log("inside requestTokenUri");
        try {
                const id = uuid.v4();
                const requestToken = await this.uport.createRequest(
                    {
                        requested: ['platform6'],
                        verified: ['platform6'],
                        callbackUrl: "http://localhost:3000/receiveToken?id=" + encodeURIComponent(id),
                        notifications: true
                    }
                ).catch((error) => {
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
    };


    postSignup(req: Request, res: Response, next: NextFunction) {
        req.assert("email", "Email is not valid").isEmail();

        const errors = req.validationErrors();

        if (errors) {
            req.flash("errors", errors);
            return res.redirect("/signup");
        }
    };

    private replyRestJson(code: number, data: object, res: Response): void {
        res.writeHead(code, { 'Access-Control-Allow-Origin': '*', 'Content-type': 'application/json' })
        res.write(JSON.stringify(data))
        res.end()
    }

    private replyRestError(code: number, message: string, res: Response): void {
        res.writeHead(code, { 'Access-Control-Allow-Origin': '*' })
        res.write(`Error. ${message}`)
        res.end()
    }

    private addToUPortCache (id: string, requestToken: string): string {
            this.gcUPortCache()
            const time = new Date().getTime() + 30 * 60 * 1000;
            this.uportCache[id] = { requestToken: requestToken, expiry: time }
            return id
    }

    private getFromUPortCache(id: string): CacheEntry {
            const entry = this.uportCache[id]
            if (!entry) {
                return void 0
            }
            if (entry.expiry <= new Date().getTime()) {
                return void 0
            }
            return entry
    }

    private gcUPortCache() {
        const time = new Date().getTime()
        Object.keys(this.uportCache).forEach(id => {
            const v = this.uportCache[id]
            if (v.expiry <= time) {
                delete this.uportCache[id]
            }
        })
    }
}









