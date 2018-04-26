import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as flash from "express-flash";
import * as path from "path";

import * as expressValidator from "express-validator";
import * as nodemailer from 'nodemailer'


// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "ondiflosup", // generated ethereal user
        pass: "ondiflo1!"  // generated ethereal password
    }
});

const restServerController = new userController.RESTServer(transporter, new userController.Logger());

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.get("/requestTokenUri", restServerController.requestTokenUri.bind(restServerController));
app.get("/receiveToken", restServerController.receiveToken.bind(restServerController));
app.get("/sendEmail", restServerController.sendEmail.bind(restServerController));

module.exports = app;