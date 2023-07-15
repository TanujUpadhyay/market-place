const nodemailer = require("nodemailer");
const { MAIL_USERNAME, MAIL_PASSWORD } = require("../../config");

// configure the transporter for nodemailer to use gmail account to send mails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USERNAME,
    pass: MAIL_PASSWORD,
  },
});

module.exports = transporter;
