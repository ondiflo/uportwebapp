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

class CacheEntry {
    requestToken: string;
    responseToken: Token;
    creds: any;
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
    private uportCache: CacheEntry = new CacheEntry();

    constructor(emailTransport: nodemailer.Transporter, logger: Logger) {
        this.emailTransport = emailTransport
        this.logger = logger
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
                        callbackUrl: "http://uportwebapp-2/receiveToken?id=" + encodeURIComponent(id),
                        notifications: true
                    }
                ).catch((error) => {
                    console.log("Failed while requesting token. ", error);
                });


            console.log("===Request Token:", requestToken);

            res.send({
                error: "success",
                requestToken: requestToken
            });
            
        }
        catch (e) {
            console.log(0, "Failed while requesting token. " + e.message, e.stack);
            res.send({
                error: e.message
            });
        }
    };

    public async receiveToken(req: Request, res: Response) {
        // try parsing the response ans send 200 ASAP
        let id: string
        let access_token: Token

        try {
            
            access_token = JSON.parse(req.body)['access_token'];
        }
        catch (e) {
            res.send({
                error: "Error acessing token"
            });

            return;
        }

        // process the received access_token
        try {
            const token: Token = await this.uport.receive(access_token);
            console.log("TOKEN", token);
            // check credentials on the token
            const creds = await this.uport.lookup(token.address);
            console.log("CREDS", creds);

            this.uportCache.creds = creds;
        }
        catch (e) {
            const msg = "Failed processing access_token. " + e.message;
            this.logger.log(0, msg, e.stack);
        }
    }

    public async sendEmail(req: Request, res: Response) {

        try {
            const body = JSON.parse(request.body);
            const email = body['email'] as string;

            const attestation = await this.uport.attest(
                {
                    sub: '0x' + this.uportCache.responseToken.address, // uport address of user
                    exp: new Date().getTime() / 1000 + 2 * 60, // If your information is not permanent make sure to add an expires timestamp
                    claim: { platform6: email }
                });
        }
        catch (error) {
            
        }
    }

  
}









