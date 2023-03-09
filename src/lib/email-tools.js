import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_KEY);

export const sendsRegistrationEmail = async (recipientAdress) => {
  const msg = {
    to: recipientAdress, // Change to your recipient
    from: process.env.SENDER_EMAIL_ADDRESS, // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };
  await sgMail
    .send(msg)
    .then(() => {
      console.log(`Email sent to ${recipientAdress}`);
    })
    .catch((error) => {
      console.error(error);
    });
};
