import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // You can change this to your preferred email service
        auth: {
            user: process.env.EMAIL_USER, // Your email address
            pass: process.env.EMAIL_PASS  // Your email password or app password
        }
    });
};

// Email templates
const emailTemplates = {
    adminNotification: (userData) => ({
        subject: '🔔 New User Registration - Approval Required',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">New User Registration</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">New User Awaiting Approval</h2>
                    
                    <p>A new user has registered and is awaiting admin approval:</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Full Name:</td>
                                <td style="padding: 8px 0; color: #333;">${userData.fullName}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                                <td style="padding: 8px 0; color: #333;">${userData.email}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td>
                                <td style="padding: 8px 0; color: #333;">${userData.phoneNumber || 'Not provided'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Account Type:</td>
                                <td style="padding: 8px 0; color: #333;">${userData.donorType}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Registration Date:</td>
                                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString()}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="margin-bottom: 20px; color: #666;">Please log in to the admin panel to review and approve this registration.</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                           style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Review Registration →
                        </a>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated notification from Malasackit Portal.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    userConfirmation: (userData) => ({
        subject: '✅ Registration Successful - Awaiting Approval',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Registration Confirmation</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">Welcome, ${userData.fullName}!</h2>
                    
                    <p>Thank you for registering with Malasackit Portal. Your account has been successfully created.</p>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #856404; margin: 0 0 10px 0;">⏳ Account Status: Pending Approval</h3>
                        <p style="color: #856404; margin: 0;">Your account is currently under review by our administrators. You will receive an email notification once your account has been approved and you can begin using the portal.</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Account Details:</h3>
                        <ul style="color: #555; line-height: 1.6;">
                            <li><strong>Email:</strong> ${userData.email}</li>
                            <li><strong>Account Type:</strong> ${userData.donorType}</li>
                            <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666;">If you have any questions, please contact our support team.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated confirmation from Malasackit Portal.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    userApprovalNotification: (userData) => ({
        subject: '🎉 Account Approved - Welcome to Malasackit Portal!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Account Approved</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">Congratulations, ${userData.fullName}!</h2>
                    
                    <div style="background: #d1edff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #0369a1; margin: 0 0 10px 0;">✅ Account Status: Approved</h3>
                        <p style="color: #0369a1; margin: 0;">Your account has been approved by our administrators. You can now log in and start using the Malasackit Portal!</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="margin-bottom: 20px; color: #666;">Click the button below to log in to your account:</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                           style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Log In Now →
                        </a>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
                        <ul style="color: #555; line-height: 1.6;">
                            <li>Make donations to support our community</li>
                            <li>Track your donation history</li>
                            <li>View impact reports and analytics</li>
                            <li>Participate in community events</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666;">Thank you for joining our mission to help those in need. Together, we can make a difference!</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated notification from Malasackit Portal.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    passwordResetRequest: (userData, resetToken) => ({
        subject: '🔐 Password Reset Request - Malasackit Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">Hello, ${userData.full_name}!</h2>
                    
                    <p>We received a request to reset your password for your Malasackit Portal account.</p>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #856404; margin: 0 0 10px 0;">🔐 Password Reset Request</h3>
                        <p style="color: #856404; margin: 0;">If you requested this password reset, click the button below to create a new password. This link will expire in 1 hour for security reasons.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="margin-bottom: 20px; color: #666;">Click the button below to reset your password:</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}" 
                           style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Reset Password →
                        </a>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Security Information:</h3>
                        <ul style="color: #555; line-height: 1.6;">
                            <li><strong>Account:</strong> ${userData.email}</li>
                            <li><strong>Request Time:</strong> ${new Date().toLocaleString()}</li>
                            <li><strong>Expires:</strong> ${new Date(Date.now() + 60 * 60 * 1000).toLocaleString()}</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fee2e2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Did not request this?</h3>
                        <p style="color: #dc2626; margin: 0;">If you did not request a password reset, please ignore this email. Your password will not be changed. If you're concerned about your account security, please contact our support team.</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated security notification from Malasackit Portal.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    passwordResetSuccess: (userData) => ({
        subject: '✅ Password Successfully Reset - Malasackit Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Successful</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">Hello, ${userData.full_name}!</h2>
                    
                    <div style="background: #d1edff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #0369a1; margin: 0 0 10px 0;">✅ Password Successfully Reset</h3>
                        <p style="color: #0369a1; margin: 0;">Your password has been successfully reset. You can now log in to your Malasackit Portal account using your new password.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="margin-bottom: 20px; color: #666;">Click the button below to log in to your account:</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                           style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Log In Now →
                        </a>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Security Reminder:</h3>
                        <ul style="color: #555; line-height: 1.6;">
                            <li>Keep your password secure and don't share it with anyone</li>
                            <li>Use a strong, unique password for your account</li>
                            <li>Log out when using shared computers</li>
                            <li>Contact support if you notice any suspicious activity</li>
                        </ul>
                    </div>
                    
                    <p style="color: #666;">If you did not reset your password, please contact our support team immediately.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated security notification from Malasackit Portal.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    })
};

// Send email function
export const sendEmail = async (to, template) => {
    try {
        console.log('Attempting to send email to:', to);
        console.log('Email config check:');
        console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
        console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
        
        // Skip email sending if email credentials are not configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('❌ Email credentials not configured. Skipping email notification.');
            console.log('Please check your .env file for EMAIL_USER and EMAIL_PASS variables.');
            return { success: true, message: 'Email skipped - credentials not configured' };
        }

        console.log('✅ Email credentials found, creating transporter...');
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Malasackit Portal" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: template.subject,
            html: template.html
        };

        console.log('Sending email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
        
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        return { success: false, error: error.message };
    }
};

// Specific email functions
export const notifyAdminOfNewRegistration = async (userData) => {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (!adminEmail) {
        console.log('Admin email not configured. Skipping admin notification.');
        return { success: false, message: 'Admin email not configured' };
    }
    
    const template = emailTemplates.adminNotification(userData);
    return await sendEmail(adminEmail, template);
};

export const sendRegistrationConfirmation = async (userData) => {
    const template = emailTemplates.userConfirmation(userData);
    return await sendEmail(userData.email, template);
};

export const sendUserApprovalNotification = async (userData) => {
    const template = emailTemplates.userApprovalNotification(userData);
    return await sendEmail(userData.email, template);
};

export const sendPasswordResetEmail = async (userData, resetToken) => {
    const template = emailTemplates.passwordResetRequest(userData, resetToken);
    return await sendEmail(userData.email, template);
};

export const sendPasswordResetConfirmation = async (userData) => {
    const template = emailTemplates.passwordResetSuccess(userData);
    return await sendEmail(userData.email, template);
};