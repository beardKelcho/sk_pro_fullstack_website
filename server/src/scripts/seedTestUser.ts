/**
 * CI E2E Test Kullanıcısı Seed Script'i
 *
 * Bu script, Cypress E2E testlerinin kullandığı test kullanıcısını MongoDB'ye ekler.
 * Yalnızca CI/CD pipeline'da E2E testlerinden önce çalıştırılmalıdır.
 *
 * Kullanıcı bilgileri (cypress.config.ts ile eşleşmelidir):
 *   Email: test@example.com
 *   Password: Test123!
 *   Role: ADMIN
 *   2FA: Disabled
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const maskConnectionString = (value: string): string => {
    try {
        const parsed = new URL(value);
        return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    } catch {
        return '[hidden]';
    }
};

const seedTestUser = async () => {
    const mongoUri =
        process.env.MONGODB_URI ||
        process.env.MONGO_URI ||
        'mongodb://localhost:27017/skproduction-test';
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Test123!';

    // eslint-disable-next-line no-console
    console.log(`[seedTestUser] Connecting to MongoDB: ${maskConnectionString(mongoUri)}`);
    await mongoose.connect(mongoUri);

    // Dinamik model yükleme (typecheck sırasında import döngülerinden kaçınmak için)
    const User = (await import('../models/User')).default;

    const existing = await User.findOne({ email: testEmail });
    if (existing) {
        // eslint-disable-next-line no-console
        console.log(`[seedTestUser] Test user already exists: ${testEmail} — skipping.`);
        await mongoose.connection.close();
        process.exit(0);
    }

    // Password will be hashed by the User model's pre-save hook
    await User.create({
        name: 'CI Test User',
        email: testEmail,
        password: testPassword,
        role: 'ADMIN',
        isActive: true,
        is2FAEnabled: false,
    });

    // eslint-disable-next-line no-console
    console.log(`[seedTestUser] ✅ Test user created: ${testEmail}`);
    await mongoose.connection.close();
    process.exit(0);
};

seedTestUser().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[seedTestUser] ❌ Error:', err);
    process.exit(1);
});

export default seedTestUser;
