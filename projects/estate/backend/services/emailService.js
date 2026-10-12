const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const emailWrapper = (title, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f7fa; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0B1F3A 0%, #1a3a5c 100%); padding: 30px; text-align: center; }
    .header h1 { color: #D4AF37; margin: 0; font-size: 24px; letter-spacing: 1px; }
    .header p { color: #ffffff; margin: 5px 0 0; font-size: 12px; opacity: 0.8; }
    .content { padding: 30px; color: #333333; line-height: 1.7; }
    .content h2 { color: #0B1F3A; margin-top: 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #D4AF37, #b8962e); color: #0B1F3A; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; margin: 15px 0; letter-spacing: 0.5px; }
    .footer { background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #888; font-size: 12px; margin: 5px 0; }
    .divider { height: 1px; background: linear-gradient(to right, transparent, #D4AF37, transparent); margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>LIL MOSEY ESTATE 6G EDITION</h1>
      <p>Finding Your Perfect Property, Simplified</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Lil Mosey Estate 6G Edition. All rights reserved.</p>
      <p>Westlands Business Park, Nairobi, Kenya</p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createTransporter();

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('SMTP credentials not configured. Email not sent.');
      return { success: false, message: 'SMTP not configured' };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Lil Mosey Estate 6G Edition'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${subject}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
    return { success: false, error: error.message };
  }
};

exports.sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const content = `
    <h2>Welcome to Lil Mosey Estate 6G Edition!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for joining Lil Mosey Estate 6G Edition. We're excited to help you find your perfect property.</p>
    <div class="divider"></div>
    <p>Please verify your email address by clicking the button below:</p>
    <center><a href="${verificationUrl}" class="btn">Verify Email Address</a></center>
    <p style="color: #888; font-size: 13px;">If the button doesn't work, copy this link: ${verificationUrl}</p>
    <p style="color: #888; font-size: 13px;">This link expires in 24 hours.</p>
  `;
  return sendEmail(email, 'Verify Your Email - Lil Mosey Estate 6G Edition', emailWrapper('Email Verification', content));
};

exports.sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <center><a href="${resetUrl}" class="btn">Reset Password</a></center>
    <p style="color: #888; font-size: 13px;">This link expires in 1 hour.</p>
    <p style="color: #888; font-size: 13px;">If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(email, 'Reset Your Password - Lil Mosey Estate 6G Edition', emailWrapper('Password Reset', content));
};

exports.sendLoginNotification = async (email, name) => {
  const content = `
    <h2>Login Notification</h2>
    <p>Hi ${name},</p>
    <p>A new login was detected on your Lil Mosey Estate 6G Edition account.</p>
    <div class="divider"></div>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>IP Address:</strong> Unknown</p>
    <p>If this wasn't you, please change your password immediately.</p>
  `;
  return sendEmail(email, 'Login Notification - Lil Mosey Estate 6G Edition', emailWrapper('Login Alert', content));
};

exports.sendBookingNotification = async (email, agentName, propertyTitle, date, time) => {
  const content = `
    <h2>New Booking Request</h2>
    <p>Hi ${agentName},</p>
    <p>You have a new booking request for <strong>${propertyTitle}</strong>.</p>
    <div class="divider"></div>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
    <p>Please log in to your dashboard to confirm or manage this booking.</p>
  `;
  return sendEmail(email, 'New Booking Request - Lil Mosey Estate 6G Edition', emailWrapper('Booking Request', content));
};

exports.sendBookingConfirmation = async (email, name, propertyTitle, date, time) => {
  const content = `
    <h2>Booking Confirmed!</h2>
    <p>Hi ${name},</p>
    <p>Your property viewing has been confirmed.</p>
    <div class="divider"></div>
    <p><strong>Property:</strong> ${propertyTitle}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
    <p>Please arrive on time. If you need to reschedule, contact your agent.</p>
  `;
  return sendEmail(email, 'Booking Confirmed - Lil Mosey Estate 6G Edition', emailWrapper('Booking Confirmation', content));
};

exports.sendPaymentReceipt = async (email, name, amount, reference, date) => {
  const content = `
    <h2>Payment Receipt</h2>
    <p>Hi ${name},</p>
    <p>Thank you for your payment. Here are your payment details:</p>
    <div class="divider"></div>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #666;">Amount:</td><td style="padding: 8px 0; font-weight: bold;">KES ${Number(amount).toLocaleString()}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Reference:</td><td style="padding: 8px 0;">${reference}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Date:</td><td style="padding: 8px 0;">${date}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Status:</td><td style="padding: 8px 0; color: #2E8B57; font-weight: bold;">Completed</td></tr>
    </table>
    <p style="margin-top: 20px;">Please keep this receipt for your records.</p>
  `;
  return sendEmail(email, 'Payment Receipt - Lil Mosey Estate 6G Edition', emailWrapper('Payment Receipt', content));
};

exports.sendPropertyApprovedEmail = async (email, name, propertyTitle) => {
  const content = `
    <h2>Property Approved!</h2>
    <p>Hi ${name},</p>
    <p>Great news! Your property listing has been approved and is now live on our website.</p>
    <div class="divider"></div>
    <p><strong>Property:</strong> ${propertyTitle}</p>
    <p>Buyers and renters can now view and inquire about your property.</p>
  `;
  return sendEmail(email, 'Property Approved - Lil Mosey Estate 6G Edition', emailWrapper('Property Approval', content));
};

exports.sendContactFormEmail = async (name, email, subject, message) => {
  const content = `
    <h2>New Contact Message</h2>
    <p><strong>From:</strong> ${name} (${email})</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <div class="divider"></div>
    <p>${message}</p>
  `;
  return sendEmail(process.env.FROM_EMAIL || 'kariukimoseswambugu@gmail.com',
    `Contact Form: ${subject}`, emailWrapper('New Contact Message', content));
};

exports.sendContactReplyEmail = async (email, name, subject, reply) => {
  const content = `
    <h2>Reply to Your Message</h2>
    <p>Hi ${name},</p>
    <p>Thank you for contacting Lil Mosey Estate 6G Edition. Here is our response to your message about "<strong>${subject}</strong>":</p>
    <div class="divider"></div>
    <p>${reply}</p>
    <p>If you have further questions, feel free to contact us again.</p>
  `;
  return sendEmail(email, `Re: ${subject} - Lil Mosey Estate 6G Edition`, emailWrapper('Your Reply', content));
};

exports.sendAppointmentReminder = async (email, name, propertyTitle, date, time) => {
  const content = `
    <h2>Appointment Reminder</h2>
    <p>Hi ${name},</p>
    <p>This is a reminder for your upcoming property viewing appointment.</p>
    <div class="divider"></div>
    <p><strong>Property:</strong> ${propertyTitle}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
    <p>Please arrive 10 minutes early. If you need to reschedule, contact your agent.</p>
  `;
  return sendEmail(email, 'Appointment Reminder - Lil Mosey Estate 6G Edition', emailWrapper('Appointment Reminder', content));
};

exports.sendWelcomeEmail = async (email, name) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const content = `
    <h2>Welcome to Lil Mosey Estate 6G Edition, ${name}!</h2>
    <p>We are thrilled to have you join our community of property seekers. Your account is all set up and ready to explore the best properties in Kenya.</p>
    <div class="divider"></div>
    <h3 style="color:#0B1F3A; font-size: 16px;">Here is what you can do next:</h3>
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #eee;">
          <strong style="color:#D4AF37;">1. Browse Properties</strong><br>
          <span style="color:#666; font-size:13px;">Explore hundreds of verified listings across Nairobi and beyond.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #eee;">
          <strong style="color:#D4AF37;">2. Save Favorites</strong><br>
          <span style="color:#666; font-size:13px;">Bookmark properties you love and compare them side by side.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid #eee;">
          <strong style="color:#D4AF37;">3. Book a Viewing</strong><br>
          <span style="color:#666; font-size:13px;">Schedule a property visit with our expert agents at your convenience.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <strong style="color:#D4AF37;">4. Calculate Your Budget</strong><br>
          <span style="color:#666; font-size:13px;">Use our mortgage calculator to understand what you can afford.</span>
        </td>
      </tr>
    </table>
    <center><a href="${frontendUrl}/properties" class="btn">Start Exploring</a></center>
    <div class="divider"></div>
    <p style="color:#888; font-size:13px;">Need help? Reply to this email or contact us at +254 700 000 000. Our team is available 24/7.</p>
  `;
  return sendEmail(email, 'Welcome to Lil Mosey Estate 6G Edition!', emailWrapper('Welcome Aboard', content));
};
