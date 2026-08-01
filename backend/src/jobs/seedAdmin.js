import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables');
      process.exit(1);
    }

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin user already exists: ${adminEmail}`);

      // Update to super_admin if not already
      if (existingAdmin.role !== 'super_admin') {
        existingAdmin.role = 'super_admin';
        await existingAdmin.save();
        console.log('Updated to super_admin role');
      }
    } else {
      // Create super admin
      const admin = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'super_admin',
        isEmailVerified: true,
      });

      console.log(`\n✅ Super Admin created successfully!`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
      console.log(`\n⚠️  IMPORTANT: Change the default password after first login!\n`);
    }

    // Create default site settings if not exists
    const existingSettings = await SiteSettings.findOne();
    if (!existingSettings) {
      await SiteSettings.create({});
      console.log('✅ Default site settings created');
    }

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
