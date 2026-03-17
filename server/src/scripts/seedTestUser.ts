/**
 * CI E2E Test Kullanıcısı Seed Script'i
 *
 * Bu script, Cypress E2E testlerinin kullandığı test kullanıcısını MongoDB'ye ekler.
 * Yalnızca CI/CD pipeline'da E2E testlerinden önce çalıştırılmalıdır.
 *
 * Kullanıcı bilgileri (cypress.config.ts ile eşleşmelidir):
 *   Email: test@skpro.com.tr
 *   Password: Test123!
 *   Role: ADMIN
 *   2FA: Disabled
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedTestUser = async () => {
    const mongoUri =
        process.env.MONGODB_URI ||
        process.env.MONGO_URI ||
        'mongodb://localhost:27017/skproduction-test';

    console.log(`[seedTestUser] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    // Dinamik model yükleme (typecheck sırasında import döngülerinden kaçınmak için)
    const User = (await import('../models/User')).default;

    const TEST_EMAIL = 'test@skpro.com.tr';

    const existing = await User.findOne({ email: TEST_EMAIL });
    if (existing) {
        console.log(`[seedTestUser] Test user already exists: ${TEST_EMAIL} — skipping.`);
        await mongoose.connection.close();
        process.exit(0);
    }

    // Password will be hashed by the User model's pre-save hook
    await User.create({
        name: 'CI Test User',
        email: TEST_EMAIL,
        password: 'Test123!',
        role: 'ADMIN',
        isActive: true,
        is2FAEnabled: false,
    });

    console.log(`[seedTestUser] ✅ Test user created: ${TEST_EMAIL}`);
    await mongoose.connection.close();
    process.exit(0);
};

seedTestUser().catch((err) => {
    console.error('[seedTestUser] ❌ Error:', err);
    process.exit(1);
});

export default seedTestUser;
