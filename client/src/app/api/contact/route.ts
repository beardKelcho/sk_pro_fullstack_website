import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email gönderimi için transporter oluştur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Form validasyonu
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Tüm alanları doldurunuz.' },
        { status: 400 }
      );
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir email adresi giriniz.' },
        { status: 400 }
      );
    }

    // Email içeriği
    const contactRecipient = (process.env.CONTACT_EMAIL && process.env.CONTACT_EMAIL.trim() !== '')
      ? process.env.CONTACT_EMAIL
      : 'info@skpro.com.tr';

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: contactRecipient,
      subject: `Yeni İletişim Formu Mesajı - ${name}`,
      html: `
        <h2>Yeni İletişim Formu Mesajı</h2>
        <p><strong>İsim:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mesaj:</strong></p>
        <p>${message}</p>
      `,
    };

    // Email gönder
    await transporter.sendMail(mailOptions);

    // Başarılı yanıt
    return NextResponse.json(
      { message: 'Mesajınız başarıyla gönderildi.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email gönderimi sırasında hata:', error);
    return NextResponse.json(
      { error: 'Mesajınız gönderilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 