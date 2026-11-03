// One-off migration: hash any passwords still stored in plaintext.
// Safe to run more than once; rows that already hold a bcrypt hash are skipped.
//
//   cd backend && node scripts/hashExistingPasswords.js
require('dotenv').config();
const prisma = require('../prisma/prismaClient');
const { hashPassword } = require('../models/users.model');

const BCRYPT_PREFIX = /^\$2[aby]\$\d{2}\$/;

(async () => {
    const users = await prisma.user.findMany({ select: { id: true, password: true } });
    const plaintext = users.filter(u => !BCRYPT_PREFIX.test(u.password));

    for (const u of plaintext) {
        await prisma.user.update({
            where: { id: u.id },
            data: { password: await hashPassword(u.password) }
        });
    }

    console.log(`Hashed ${plaintext.length} of ${users.length} user passwords.`);
    await prisma.$disconnect();
})().catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
});
