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

    emailVerification: (userData, verificationToken) => ({
        subject: '✉️ Verify Your Email - Malasackit Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">Hello, ${userData.full_name || userData.fullName}!</h2>
                    
                    <p>Thank you for registering with Malasackit Portal. Please verify your email address to complete your registration.</p>
                    
                    <div style="background: #d1edff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #0369a1; margin: 0 0 10px 0;">📧 Email Verification Required</h3>
                        <p style="color: #0369a1; margin: 0;">Click the button below to verify your email address. This link will expire in 24 hours for security reasons.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="margin-bottom: 20px; color: #666;">Click the button below to verify your email:</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}" 
                           style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Verify Email →
                        </a>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Account Information:</h3>
                        <ul style="color: #555; line-height: 1.6;">
                            <li><strong>Email:</strong> ${userData.email}</li>
                            <li><strong>Request Time:</strong> ${new Date().toLocaleString()}</li>
                            <li><strong>Expires:</strong> ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}</li>
                        </ul>
                    </div>
                    
                    <div style="background: #fee2e2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Did not request this?</h3>
                        <p style="color: #991b1b; margin: 0;">If you did not create an account with Malasackit Portal, you can safely ignore this email. The verification link will expire automatically.</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated email from Malasackit Portal.<br>
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
    }),

    // Donation-related email templates
    donationApproved: (donorData, donationData, appointmentData) => ({
        subject: '🎉 Donation Request Approved - Thank You!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Donation Request Approved</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">Great News, ${donorData.full_name}!</h2>
                    
                    <div style="background: #d1f2eb; border: 1px solid #52c41a; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #389e0d; margin: 0 0 10px 0;">✅ Your Donation Request Has Been Approved!</h3>
                        <p style="color: #389e0d; margin: 0;">We're excited to receive your generous donation. Your contribution will make a significant impact in our community.</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Donation Details:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Donation ID:</td>
                                <td style="padding: 8px 0; color: #333;">#${donationData.donation_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Delivery Method:</td>
                                <td style="padding: 8px 0; color: #333;">${donationData.delivery_method}</td>
                            </tr>
                            ${appointmentData ? `
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Appointment Date:</td>
                                <td style="padding: 8px 0; color: #333;">${new Date(appointmentData.appointment_date).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Appointment Time:</td>
                                <td style="padding: 8px 0; color: #333;">${appointmentData.appointment_time}</td>
                            </tr>
                            ` : ''}
                        </table>
                    </div>
                    
                    ${appointmentData ? `
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <h3 style="color: #856404; margin: 0 0 10px 0;">📅 Next Steps</h3>
                            <p style="color: #856404; margin: 0;">Please be available at the scheduled time. Our team will ${donationData.delivery_method === 'pickup' ? 'visit your location' : 'be waiting at our office'} to collect your donation.</p>
                        </div>
                    ` : `
                        <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <h3 style="color: #0050b3; margin: 0 0 10px 0;">📞 Next Steps</h3>
                            <p style="color: #0050b3; margin: 0;">Our team will contact you soon to schedule the ${donationData.delivery_method}. Please keep your phone available.</p>
                        </div>
                    `}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="margin-bottom: 20px; color: #666;">View your donation details:</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/donor/donations/${donationData.donation_id}" 
                           style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            View Donation →
                        </a>
                    </div>
                    
                    <p style="color: #666; text-align: center;">Thank you for your generosity and for making a difference in our community! 🙏</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated notification from Malasackit Portal.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    donationRejected: (donorData, donationData, reason) => ({
        subject: '📝 Donation Request Update - Action Required',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Donation Request Update</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">Hello, ${donorData.full_name}</h2>
                    
                    <div style="background: #ffeaa7; border: 1px solid #fadb14; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #ad6800; margin: 0 0 10px 0;">📝 Donation Request Status Update</h3>
                        <p style="color: #ad6800; margin: 0;">We regret to inform you that your donation request could not be processed at this time.</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Donation Details:</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Donation ID:</td>
                                <td style="padding: 8px 0; color: #333;">#${donationData.donation_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Submission Date:</td>
                                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString()}</td>
                            </tr>
                        </table>
                        ${reason ? `
                            <h4 style="color: #333; margin: 15px 0 5px 0;">Reason:</h4>
                            <p style="color: #666; margin: 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">${reason}</p>
                        ` : ''}
                    </div>
                    
                    <div style="background: #e6f7ff; border: 1px solid #91d5ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #0050b3; margin: 0 0 10px 0;">💡 What's Next?</h3>
                        <p style="color: #0050b3; margin: 0;">You can submit a new donation request or contact our support team if you have questions. We appreciate your willingness to help our community!</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/donor/donate" 
                           style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                            Submit New Request →
                        </a>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/contact" 
                           style="background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Contact Support
                        </a>
                    </div>
                    
                    <p style="color: #666; text-align: center;">Thank you for your understanding and continued support of our mission. 🙏</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated notification from Malasackit Portal.<br>
                        Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    donationCompleted: (donorData, donationData, itemCount, totalValue) => ({
        subject: '🎉 Donation Received - Thank You for Your Generosity!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">🏥 Malasackit Portal</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Donation Completed</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5;">
                    <h2 style="color: #dc2626; margin-top: 0;">Thank You, ${donorData.full_name}! 🎉</h2>
                    
                    <div style="background: #d1f2eb; border: 1px solid #52c41a; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #389e0d; margin: 0 0 10px 0;">✅ Donation Successfully Received!</h3>
                        <p style="color: #389e0d; margin: 0;">Your generous donation has been successfully received and processed. It will now help make a positive impact in our community!</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Donation Summary:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Donation ID:</td>
                                <td style="padding: 8px 0; color: #333;">#${donationData.donation_id}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Items Received:</td>
                                <td style="padding: 8px 0; color: #333;">${itemCount} item types</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Total Value:</td>
                                <td style="padding: 8px 0; color: #333; font-weight: bold;">₱${totalValue.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #555;">Completed Date:</td>
                                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString()}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #fff7e6; border: 1px solid #ffd591; padding: 20px; border-radius: 6px; margin: 20px 0;">
                        <h3 style="color: #d46b08; margin: 0 0 15px 0;">🌟 Your Impact</h3>
                        <p style="color: #d46b08; margin: 0; line-height: 1.6;">Your donation will directly help families and individuals in need within our community. Every item you've contributed brings hope and relief to those who need it most.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="margin-bottom: 20px; color: #666;">View your donation history and impact:</p>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/donor/donations" 
                           style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
                            View Donations →
                        </a>
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/donor/donate" 
                           style="background: #52c41a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Donate Again →
                        </a>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <h3 style="color: #333; margin-top: 0;">🙏 From Our Community</h3>
                        <p style="color: #666; font-style: italic; margin: 0;">"Thank you for your kindness and generosity. Your donation helps us continue our mission of supporting those in need and building a stronger, more caring community."</p>
                        <p style="color: #999; font-size: 14px; margin: 10px 0 0 0;">- Malasackit Portal Team</p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
                    
                    <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
                        This is an automated notification from Malasackit Portal.<br>
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

// Donation-related email functions
export const sendDonationApprovalEmail = async (donorData, donationData, appointmentData = null) => {
    const template = emailTemplates.donationApproved(donorData, donationData, appointmentData);
    return await sendEmail(donorData.email, template);
};

export const sendDonationRejectionEmail = async (donorData, donationData, reason = null) => {
    const template = emailTemplates.donationRejected(donorData, donationData, reason);
    return await sendEmail(donorData.email, template);
};

export const sendDonationCompletionEmail = async (donorData, donationData, itemCount, totalValue) => {
    const template = emailTemplates.donationCompleted(donorData, donationData, itemCount, totalValue);
    return await sendEmail(donorData.email, template);
};

export const sendEmailVerification = async (userData, verificationToken) => {
    const template = emailTemplates.emailVerification(userData, verificationToken);
    return await sendEmail(userData.email, template);
};