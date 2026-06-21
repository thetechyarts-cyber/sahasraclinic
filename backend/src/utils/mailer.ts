import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  await transporter.sendMail({
    from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

// Usage examples
export const sendOTPEmail = async (to: string, otp: string) => {
  await sendEmail({
    to,
    subject: 'Your OTP — HMS',
    html: `<p>Your OTP is <strong>${otp}</strong>. Valid for 5 minutes.</p>`,
  });
};

export const sendPaymentConfirmationEmail = async (to: string, patientName: string, amount: string) => {
  await sendEmail({
    to,
    subject: 'Payment Confirmed — HMS',
    html: `<p>Dear ${patientName}, your payment of ₹${amount} has been confirmed. You have been added to the queue.</p>`,
  });
};
