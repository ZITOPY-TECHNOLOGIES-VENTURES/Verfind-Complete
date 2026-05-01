'use strict';
/**
 * Creates the Verifind admin account.
 * Run once after a DB reset:  node seed-admin.js
 *
 * Override defaults via env:
 *   ADMIN_EMAIL=you@email.com ADMIN_PASSWORD=yourpass node seed-admin.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const EMAIL    = process.env.ADMIN_EMAIL    || 'admin@getverifind.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Verifind@Admin2026';
const USERNAME = process.env.ADMIN_USERNAME || 'Verifind Admin';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`Admin already exists: ${EMAIL} (role: ${existing.role})`);
    return;
  }

  const hashed = await bcrypt.hash(PASSWORD, 12);
  const admin = await prisma.user.create({
    data: {
      username: USERNAME,
      email: EMAIL,
      password: hashed,
      role: 'admin',
      isEmailVerified: true,
      isKycVerified: true,
    },
  });

  console.log('✅ Admin account created');
  console.log(`   Email:    ${admin.email}`);
  console.log(`   ID:       ${admin.id}`);
  console.log('\nChange the password after first login.');
}

main()
  .catch(err => { console.error('❌', err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
