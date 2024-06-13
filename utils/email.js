const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
this.to = user.email;
this.firstName = user.name.split(' ')[0];
this.url = url;
this.from = `Kseniia Ernest <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EML_PASSWORD,
      }
    });
  }

  async send(templale, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Define email options
    const emailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
    
  }

 async sendWelcome() {
   await this.send('welcome', 'Welcome to the Natours Familty!')
  }
};


/*
const sendEmail = async options => {
 
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EML_PASSWORD,
    },
    // secure: false
    
  })
    
  // 2) Define email options
  const emailOptions = {
    from: 'Kseniia Ernest <kseniia@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  // 3) Send the email
  await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;
*/