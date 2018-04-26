
const proxyBaseURL = 'https://uportwebapp-2.herokuapp.com/'

let getLogin = function () {

    GET(proxyBaseURL + '/requestTokenUri').then(
        (response: string) => {
            try {
                const json = JSON.parse(response)
                const requestToken = json.requestToken
                const pollId = json.pollId
                const uri = `me.uport:me?requestToken=${requestToken}`
                console.log("URI", uri)
                showQRCode(uri);
                pollId();
            }
            catch (e) {
                console.log("Failed showing QR Code. " + e.message);
            }
        },
        (err) => console.log("Failed getting request token. " + err.message));
    
};

// this function will display the QRCode from the uPort uri, using kjua
function showQRCode(uri: string) {
    const qr = kjua({
        text: uri,
        fill: '#000000',
        size: 250,
        back: 'rgba(255,255,255,1)'
    });

    let qrImage = $(qr);

    $("#qrcode").append(qrImage);
}

function pollId() {
    let isCancelled: boolean = false;
    let pollHandler = setTimeout(callProxy, 3 * 1000);

    function callProxy() {

        GET(proxyBaseURL + '/pollToken').then(
            (response: string) => {
                if (isCancelled) {
                    return;
                }
                const json = JSON.parse(response);
                const status = json.status;

                switch (status) {
                    case 'wait':
                        pollHandler = setTimeout(callProxy, 3 * 1000);
                        break;
                    case 'email':
                        break;
                    case 'done':
                        isCancelled = true;
                        if (globalTimeoutHandler)
                            clearTimeout(globalTimeoutHandler);
                        break;
                    case 'error':
                        console.log("Failed logging in. " + json.data);
                        break;
                    default:
                        console.log("Unknown status. " + status);
                        break;
                }
            },
            (err) => {
                if (isCancelled) {
                    return
                }
            });

        // global timeout
        let globalTimeoutHandler = setTimeout(() => {

            if (isCancelled && pollHandler) {
                clearTimeout(pollHandler);
            }
            console.log("Timeout logging in");
        },
            10 * 60 * 1000
        ); // 10 minutes


        // start polling
        callProxy();
    }
}

function GET(url: string) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = () => req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
        req.onerror = (e) => reject(Error(`Network Error: ${e.message}`));
        req.send();
    });
}


$(document).ready(function () {
    // Place JavaScript code here...

});

