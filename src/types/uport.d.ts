declare module "uport" {

    export interface CredentialsRequest {
        /** specifies info attributes to request from user, these are non-veried (not attestations) attributes which the user adds themselves to their profile */
        requested?: string[]
        /** specifies attestation types to request from user, these are attestations encoded as JWTs. Attestations are verified in this library, you can also use existing JWT libraries for additional support. */
        verified?: string[]
        /** URL to send the response of the request to */
        callbackUrl?: string
        notifications?: boolean
    }

    export interface Network {
        registry: string,
        rpcUrl: string
    }

    export interface CredentialsOptions {
        appName: string
        address: string
        signer: Signer
        networks: {[id:string]: Network} //TODO
    }

    export type ResponseToken = string
    export type Attestation = string

    export interface Profile {
        publicKey: string
        publicEncKey: string
        verified?: string[]
        requested?: string[]
    }

    export interface Token extends Profile{
        publicKey: string
        publicEncKey: string
        address: string
        pushToken?: string
    }

    export interface Claim {
        /** uport address of user*/
        sub: string
        /** <future timestamp>, // If your information is not permanent make sure to add an expires timestamp */
        exp?: number
        /** e.g. { name: 'John Smith' } */
        claim: { [key: string]: string } | string
    }


    export interface PushPayload {
        /**  a uport request url */
        url: string
        /** a message to display to the user */
        message: string
    }

    export class Credentials {

        constructor(options: CredentialsOptions )

        createRequest( request: CredentialsRequest ): Promise<ResponseToken>

        receive( responseToken: Token ): Promise<Token>

        attest( claim: Claim ): Promise<Attestation>

        lookup( address: String ): Promise<any>

        push(pushToken: string, pubEncKey: string, payload: PushPayload): Promise<Token>

        /** @deprecated */
        push(pushToken: string, payload: PushPayload): Promise<string>
    }

    export interface Signer extends Function {}

    export function SimpleSigner( signingKey: string ): Signer
}