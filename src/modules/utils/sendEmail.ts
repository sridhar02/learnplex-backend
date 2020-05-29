import nodemailer from 'nodemailer'

export enum MailType {
  ConfirmationEmail,
  ForgotPasswordEmail,
}

export async function sendEmail(
  email: string,
  url: string,
  type = MailType.ConfirmationEmail
): Promise<void> {
  let transporter

  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  } else {
    const testAccount = await nodemailer.createTestAccount()

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    })
  }

  let info
  const isEmailEnabled = process.env.IS_EMAIL_VERIFICATION_ENABLED === '1'

  if (type === MailType.ConfirmationEmail && isEmailEnabled) {
    info = await transporter.sendMail({
      from: `"Coderplex " <${process.env.EMAIL_ID}>`,
      to: email,
      subject: 'Verify Your Email to Learn with Coderplex',
      text: `Please [verify your email id](${url}) to join Coderplex and start learning or creating resources on any technology.
      
Best,
Coderplex Team
      `,
      html: `<p></p>Please <a href="${url}">verify your email id</a> to join Coderplex 
      and start learning or creating resources on any technology.</p>
      <br />
      <span>Best,<br />Coderplex Team</span>`,
    })
  } else if (type === MailType.ForgotPasswordEmail) {
    info = await transporter.sendMail({
      from: `"Coderplex " <${process.env.EMAIL_ID}>`,
      to: email,
      subject: 'Reset Your Password to Continue Learning with Coderplex',
      text: `Please Clink [this link](${url}) to reset your password and continue learning with Coderplex.
      
Best,
Coderplex Team
      `,
      html: `<p>Please click <a href="${url}">this link</a> to reset your password 
      and continue learning with Coderplex.</p>
      <br />
      <span>Best,<br />Coderplex Team</span>`,
    })
  }

  console.log('Message sent: %s', info.messageId)
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
