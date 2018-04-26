
const proxyBaseURL = 'https://uportwebapp.herokuapp.com/'

let getLogin = function () {

    GET(proxyBaseURL + '/requestTokenUri').then(
        (response: string) => {
            try {
                const json = JSON.parse(response)
                const requestToken = json.requestToken
                const pollId = json.pollId
                const uri = `me.uport:me?requestToken=${requestToken}`
                console.log("URI", uri)
                showQRCode(uri)
                
            }
            catch (e) {
                console.log("Failed showing QR Code. " + e.message)
            }
        },
        (err) => console.log("Failed getting request token. " + err.message)
    )
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

