'use strict';
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sample data for Verifind...');

  // 1. Ensure Agent user exists
  const agentEmail = 'agent@getverifind.com';
  let agent = await prisma.user.findUnique({ where: { email: agentEmail } });
  if (!agent) {
    const hashed = await bcrypt.hash('Agent@Verifind2026', 12);
    agent = await prisma.user.create({
      data: {
        username: 'Abuja Prime Realty',
        email: agentEmail,
        password: hashed,
        role: 'agent',
        isEmailVerified: true,
        isKycVerified: true,
        businessName: 'Abuja Prime Realty Ltd',
        phone: '+2348012345678',
        nin: '12345678901',
      },
    });
    console.log('✅ Created Agent account: agent@getverifind.com');
  }

  // 2. Ensure Tenant user exists
  const tenantEmail = 'tenant@getverifind.com';
  let tenant = await prisma.user.findUnique({ where: { email: tenantEmail } });
  if (!tenant) {
    const hashed = await bcrypt.hash('Tenant@Verifind2026', 12);
    tenant = await prisma.user.create({
      data: {
        username: 'Amina Bello',
        email: tenantEmail,
        password: hashed,
        role: 'tenant',
        isEmailVerified: true,
        isKycVerified: true,
        phone: '+2348098765432',
        currentAddress: 'Plot 42, Gwarimpa Estate, Abuja',
      },
    });
    console.log('✅ Created Tenant account: tenant@getverifind.com');
  }

  // 3. Clear existing sample properties to avoid duplicate clutter
  const count = await prisma.property.count();
  if (count > 0) {
    console.log(`Found ${count} existing properties. Skipping property insertion.`);
    return;
  }

  const sampleProperties = [
    {
      title: 'Luxury 3 Bedroom Apartment in Maitama',
      description: 'Ultra-modern 3 bedroom apartment featuring top-tier marble finishes, spacious en-suite bedrooms, private balcony with scenic Maitama hill views, swimming pool, elevator, and round-the-clock armed security.',
      overview: '3 Beds • 4 Baths • 250 sqm • Fully Furnished',
      aboutProperty: 'Located in the quiet, prestigious diplomatic zone of Maitama, Abuja. Equipped with 24/7 solar + generator backup power, central HVAC, water treatment plant, and underground parking.',
      listedBy: 'Listed by Abuja Prime Realty Ltd',
      district: 'Maitama',
      address: '14 Panama Street, Diplomatic Zone, Maitama, Abuja',
      type: 'Three_bedroom',
      lat: 9.0882,
      lng: 7.4983,
      baseRent: 12000000,
      serviceCharge: 1500000,
      cautionFee: 500000,
      agencyFee: 1200000,
      legalFee: 600000,
      totalInitialPayment: 15800000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80',
      ]),
      categorizedImages: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80', category: 'Front View' },
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80', category: 'Living Room' },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80', category: 'Kitchen' },
        { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80', category: 'Bedroom' },
      ]),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      bedrooms: 3,
      bathrooms: 4,
      sqm: 250,
      furnished: true,
      parking: true,
      listingMode: 'Rent',
      isFeatured: true,
      agentId: agent.id,
      agentName: 'Abuja Prime Realty Ltd',
      isVerified: true,
      verificationStage: 'verified',
      status: 'available',
    },
    {
      title: 'Modern 2 Bedroom Serviced Flat in Wuse II',
      description: 'Brand new, contemporary 2 bedroom flat situated off Adetokunbo Ademola Crescent. Features fitted kitchen, inverter system, pop ceiling, ambient lighting, and ample parking space.',
      overview: '2 Beds • 3 Baths • 140 sqm • Serviced',
      aboutProperty: 'Ideal for young professionals and corporate executives. Walking distance to Banex Plaza, gourmet restaurants, and top financial institutions.',
      listedBy: 'Listed by Abuja Prime Realty Ltd',
      district: 'Wuse',
      address: '22 Aminu Kano Crescent, Wuse II, Abuja',
      type: 'Two_bedroom',
      lat: 9.0765,
      lng: 7.4721,
      baseRent: 4500000,
      serviceCharge: 600000,
      cautionFee: 250000,
      agencyFee: 450000,
      legalFee: 225000,
      totalInitialPayment: 6025000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      ]),
      categorizedImages: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80', category: 'Living Room' },
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80', category: 'Bedroom' },
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80', category: 'Kitchen' },
      ]),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      bedrooms: 2,
      bathrooms: 3,
      sqm: 140,
      furnished: true,
      parking: true,
      listingMode: 'Rent',
      isFeatured: true,
      agentId: agent.id,
      agentName: 'Abuja Prime Realty Ltd',
      isVerified: true,
      verificationStage: 'verified',
      status: 'available',
    },
    {
      title: 'Executive 5 Bedroom Detached Duplex in Asokoro',
      description: 'Palatial 5 bedroom detached duplex with BQ, private swimming pool, lush landscaped garden, smart home automation, high perimeter wall with electric fencing, and CCTV surveillance.',
      overview: '5 Beds • 6 Baths • 600 sqm • Private Pool',
      aboutProperty: 'Situated in the high-security diplomatic enclave of Asokoro. Crafted for top tier living with double height foyer, multiple living rooms, and private penthouse master suite.',
      listedBy: 'Listed by Abuja Prime Realty Ltd',
      district: 'Asokoro',
      address: '8 Yakubu Gowon Crescent, Asokoro, Abuja',
      type: 'Detached_duplex',
      lat: 9.0528,
      lng: 7.5256,
      baseRent: 25000000,
      serviceCharge: 3000000,
      cautionFee: 1000000,
      agencyFee: 2500000,
      legalFee: 1250000,
      totalInitialPayment: 32750000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80',
      ]),
      categorizedImages: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80', category: 'Front View' },
        { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1000&q=80', category: 'Living Room' },
        { url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=80', category: 'Compound' },
      ]),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      bedrooms: 5,
      bathrooms: 6,
      sqm: 600,
      furnished: false,
      parking: true,
      listingMode: 'Rent',
      isFeatured: false,
      agentId: agent.id,
      agentName: 'Abuja Prime Realty Ltd',
      isVerified: true,
      verificationStage: 'verified',
      status: 'available',
    },
    {
      title: 'Cozy 1 Bedroom Waterfront Apartment in Jabi',
      description: 'Charming 1 bedroom apartment with spectacular views of Jabi Lake. Features open plan living area, contemporary kitchenette, high speed internet readiness, and 24/7 security control.',
      overview: '1 Bed • 1 Bath • 75 sqm • Lake View',
      aboutProperty: 'Located 2 minutes away from Jabi Lake Mall. Perfect blend of peaceful lakeside living and easy city connectivity.',
      listedBy: 'Listed by Abuja Prime Realty Ltd',
      district: 'Jabi',
      address: '5 Alex Ekwueme Way, Jabi, Abuja',
      type: 'One_bedroom',
      lat: 9.0712,
      lng: 7.4251,
      baseRent: 2200000,
      serviceCharge: 300000,
      cautionFee: 150000,
      agencyFee: 220000,
      legalFee: 110000,
      totalInitialPayment: 2980000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      ]),
      categorizedImages: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80', category: 'Bedroom' },
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80', category: 'Kitchen' },
      ]),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      bedrooms: 1,
      bathrooms: 1,
      sqm: 75,
      furnished: true,
      parking: true,
      listingMode: 'Rent',
      isFeatured: false,
      agentId: agent.id,
      agentName: 'Abuja Prime Realty Ltd',
      isVerified: true,
      verificationStage: 'verified',
      status: 'available',
    },
    {
      title: 'Spacious Self-Contain Studio in Gwarinpa',
      description: 'Neatly finished self-contained studio apartment located in a serene, gated compound in 3rd Avenue Gwarinpa. Comes with fitted wardrobe, tiled floor, neat bathroom, and steady water supply.',
      overview: 'Self Contain • 1 Bath • 45 sqm • Gated Security',
      aboutProperty: 'Great starter home for young professionals. Close to market, banks, and major transport routes.',
      listedBy: 'Listed by Abuja Prime Realty Ltd',
      district: 'Gwarimpa',
      address: '12 3rd Avenue, Gwarinpa Estate, Abuja',
      type: 'Self_contain',
      lat: 9.1098,
      lng: 7.4089,
      baseRent: 1200000,
      serviceCharge: 150000,
      cautionFee: 100000,
      agencyFee: 120000,
      legalFee: 60000,
      totalInitialPayment: 1630000,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80',
      ]),
      categorizedImages: JSON.stringify([
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80', category: 'Living Room' },
        { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80', category: 'Bathroom' },
      ]),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      bedrooms: 1,
      bathrooms: 1,
      sqm: 45,
      furnished: false,
      parking: true,
      listingMode: 'Rent',
      isFeatured: false,
      agentId: agent.id,
      agentName: 'Abuja Prime Realty Ltd',
      isVerified: true,
      verificationStage: 'verified',
      status: 'available',
    },
  ];

  for (const item of sampleProperties) {
    await prisma.property.create({ data: item });
  }

  console.log(`✅ Seeded ${sampleProperties.length} verified Abuja properties successfully!`);
}

main()
  .catch(err => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
