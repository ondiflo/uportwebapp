"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const compression = require("compression"); // compresses requests
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require("path");
const expressValidator = require("express-validator");
const nodemailer = require("nodemailer");
// Controllers (route handlers)
const homeController = require("./controllers/home");
const userController = require("./controllers/user");
// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "ondiflosup",
        pass: "ondiflo1!" // generated ethereal password
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
module.exports = app;
//# sourceMappingURL=app.js.map