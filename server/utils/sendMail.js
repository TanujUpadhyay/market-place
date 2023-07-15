const transporter = require("../utils/transporter.js");
const generateToken = require("../utils/generateToken.js");
const { FRONTEND_BASE_URL, EMAIL, APP_NAME } = require("../../config.js");
const { consoleLogger } = require("./helper.js");

const sendMail = async (id, email, option) => {
  const frontendURL = FRONTEND_BASE_URL;

  // send email for the email verification option
  if (option === "email verification") {
    // create a new JWT to verify user via email
    const emailToken = generateToken(id, "email");
    const url = `${frontendURL}/user/confirm/${emailToken}`;

    // set the correct mail option
    const mailOptions = {
      from: EMAIL, // sender address
      to: email,
      subject: `Confirm your email for ${APP_NAME}`, // Subject line
      html: `<div>
					<h2>Account Created!</h2>
					Click this link to 
					<a href="${url}">verify your account</a>
					<br>
					Note that this link is valid only for the next 15 minutes.
				</div>
				
			`,
    };

    const mailSent = await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        consoleLogger(err);
      } else {
        consoleLogger(info);
      }
    });

    // send a promise since nodemailer is async
    if (mailSent) return Promise.resolve(1);
  }
  // send a mail for resetting password if forgot password
  else if (option === "forgot password") {
    // create a new JWT to verify user via email
    const forgetPasswordToken = generateToken(id, "forgot password");
    const url = `${frontendURL}/user/password/reset/${forgetPasswordToken}`;
    const mailOptions = {
      from: EMAIL, // sender address
      to: email,
      subject: `Reset Password for ${APP_NAME}`, // Subject line
      html: `<div>
					<h2>Reset Password for your ${APP_NAME} account</h2>
					<br/>
					Forgot your password? No worries! Just click this link to 
					<a href="${url}">reset your password</a>. 
					<br>
					Note that this link is valid for only the next 10 minutes. 
				</div>
				
			`,
    };

    const mailSent = await transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        consoleLogger(err);
      } else {
        consoleLogger(info);
      }
    });

    if (mailSent) return Promise.resolve(1);
  }
};

module.exports = sendMail;
