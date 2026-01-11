// src/utils/sendEmail.js
// const nodemailer = require("nodemailer");

// module.exports.sendEmail = async (to, subject, text) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.SMTP_USER,
//       to,
//       subject,
//       text,
//     });

//     return true;
//   } catch (error) {
//     console.error("Email send error:", error.message);
//     return false;
//   }
// };

// src/utils/sendEmail.js

const nodemailer = require("nodemailer");

module.exports.sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER, // example: 9de635001@smtp-brevo.com
        pass: process.env.SMTP_PASS, // your SMTP key
      },
    });

    await transporter.sendMail({
      from: `YOUR BANK <${process.env.SENDER_EMAIL}>`, // your Outlook email
      to,
      subject,
      text,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error.message);
    return false;
  }
};
