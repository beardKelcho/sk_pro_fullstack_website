import nodemailer from 'nodemailer';

// Create email transporter
export const createEmailTransporter = () => {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // If SMTP credentials are not configured, return null
    if (!smtpUser || !smtpPass) {
        console.warn('⚠️  SMTP credentials not configured. Email sending disabled.');
        return null;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Works for Google Workspace
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        console.log('✅ Email transporter configured successfully');
        return transporter;
    } catch (error) {
        console.error('❌ Error creating email transporter:', error);
        return null;
    }
};

// Email template for contact form
export interface ContactEmailData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const createContactEmailTemplate = (data: ContactEmailData) => {
    return {
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER, // Send to yourself
        replyTo: data.email, // User can reply directly to sender
        subject: `Web Sitesi Mesajı: ${data.subject}`,
        text: `
Yeni İletişim Formu Mesajı
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gönderen: ${data.name}
Email: ${data.email}
Konu: ${data.subject}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mesaj:

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bu mesaj web sitenizin iletişim formundan gönderilmiştir.
Yanıt vermek için bu emaile doğrudan reply yapabilirsiniz.
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0066CC 0%, #0052A3 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .field { margin-bottom: 20px; }
        .field-label { font-weight: bold; color: #0066CC; margin-bottom: 5px; }
        .field-value { background: white; padding: 10px; border-radius: 4px; border: 1px solid #e0e0e0; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #0066CC; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">🔔 Yeni İletişim Formu Mesajı</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="field-label">👤 Gönderen</div>
                <div class="field-value">${data.name}</div>
            </div>
            <div class="field">
                <div class="field-label">📧 Email</div>
                <div class="field-value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            <div class="field">
                <div class="field-label">📝 Konu</div>
                <div class="field-value">${data.subject}</div>
            </div>
            <div class="field">
                <div class="field-label">💬 Mesaj</div>
                <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
            </div>
        </div>
        <div class="footer">
            Bu mesaj web sitenizin iletişim formundan gönderilmiştir.<br>
            Yanıt vermek için bu emaile doğrudan reply yapabilirsiniz.
        </div>
    </div>
</body>
</html>
        `.trim()
    };
};
