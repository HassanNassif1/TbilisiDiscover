const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  // For development, use ethereal.email (fake SMTP service for testing)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    console.log('📧 Using ethereal.email for development email testing');
    // Create a test account at ethereal.email
    return nodemailer.createTestAccount()
      .then(testAccount => {
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
        console.log(`📧 Test email account created: ${testAccount.user}`);
        return transporter;
      })
      .catch(err => {
        console.warn('⚠️ Could not create ethereal test account:', err.message);
        return null;
      });
  }

  // For production or when email credentials are provided
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('📧 Email transporter configured with SMTP');
    return Promise.resolve(transporter);
  }

  console.warn('⚠️ No email configuration found. Email sending will be simulated.');
  return Promise.resolve(null);
};

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await createTransporter();

    if (!transporter) {
      // Simulate email sending in development
      console.log('📧 [SIMULATED] Email sent to:', to);
      console.log(`📧 Subject: ${subject}`);
      console.log(`📧 Content: ${html ? 'HTML email' : text || 'No content'}`);
      
      // Log the email content for testing
      if (html) {
        console.log('📧 HTML Preview:', html.substring(0, 200) + '...');
      }
      
      return { 
        success: true, 
        messageId: `simulated-${Date.now()}`,
        simulated: true,
        preview: html ? html.substring(0, 200) + '...' : text
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@discovertbilisi.ge',
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    
    // If using ethereal, log the preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      console.log('📧 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // In development, log the error but don't fail
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Would have sent email to:', to);
      console.log(`📧 [DEV] Subject: ${subject}`);
      return { 
        success: false, 
        error: error.message,
        simulated: true,
        preview: html ? html.substring(0, 200) + '...' : text
      };
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken, fullName) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 20px; color: #64748b; font-size: 14px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Welcome to Discover Tbilisi!</h1>
      </div>
      <div class="content">
        <h2>Hello ${fullName || 'there'}!</h2>
        <p>Thank you for registering with <strong>Discover Tbilisi</strong> - your local discovery platform for Georgia's vibrant capital.</p>
        <p>Please verify your email address to start exploring the best restaurants, cafés, hotels, and events in Tbilisi.</p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        <p style="font-size: 14px; color: #64748b;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Discover Tbilisi. Powered by DevXLine</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Welcome to Discover Tbilisi!
    
    Hello ${fullName || 'there'}!
    
    Thank you for registering with Discover Tbilisi - your local discovery platform for Georgia's vibrant capital.
    
    Please verify your email address to start exploring the best restaurants, cafés, hotels, and events in Tbilisi.
    
    Verify your email: ${verificationUrl}
    
    This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
    
    © ${new Date().getFullYear()} Discover Tbilisi. Powered by DevXLine
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Discover Tbilisi',
    html,
    text
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, fullName) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 20px; color: #64748b; font-size: 14px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Password Reset</h1>
      </div>
      <div class="content">
        <h2>Hello ${fullName || 'there'}!</h2>
        <p>We received a request to reset your password for your <strong>Discover Tbilisi</strong> account.</p>
        <p>Click the button below to set a new password:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #64748b;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Discover Tbilisi. Powered by DevXLine</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Password Reset
    
    Hello ${fullName || 'there'}!
    
    We received a request to reset your password for your Discover Tbilisi account.
    
    Click the link below to set a new password:
    ${resetUrl}
    
    This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    
    © ${new Date().getFullYear()} Discover Tbilisi. Powered by DevXLine
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset - Discover Tbilisi',
    html,
    text
  });
};

// Send business approval email
const sendBusinessApprovalEmail = async (email, businessName, fullName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #22c55e, #0ea5e9); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0; border-top: none; }
        .button { display: inline-block; background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 20px; color: #64748b; font-size: 14px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Business Approved!</h1>
      </div>
      <div class="content">
        <h2>Congratulations ${fullName || 'Business Owner'}!</h2>
        <p>Your business <strong>${businessName}</strong> has been approved on <strong>Discover Tbilisi</strong>.</p>
        <p>You can now manage your business profile, add photos, respond to reviews, and reach thousands of customers in Tbilisi.</p>
        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
        </div>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Discover Tbilisi. Powered by DevXLine</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Business Approved!
    
    Congratulations ${fullName || 'Business Owner'}!
    
    Your business ${businessName} has been approved on Discover Tbilisi.
    
    You can now manage your business profile, add photos, respond to reviews, and reach thousands of customers in Tbilisi.
    
    Go to Dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard
    
    © ${new Date().getFullYear()} Discover Tbilisi. Powered by DevXLine
  `;

  return sendEmail({
    to: email,
    subject: `✅ ${businessName} - Approved on Discover Tbilisi`,
    html,
    text
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBusinessApprovalEmail,
  createTransporter
};