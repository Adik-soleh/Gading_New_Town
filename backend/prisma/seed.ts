import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashPassword } from 'better-auth/crypto';

// Polyfill Web Crypto (Node 18)
if (typeof globalThis.crypto === 'undefined') {
    globalThis.crypto = require('node:crypto').webcrypto;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // ================= CLEAN =================
    await prisma.activityLog.deleteMany();
    await prisma.report.deleteMany();
    await prisma.mutation.deleteMany();
    await prisma.renovationPermit.deleteMany();
    await prisma.iPLPayment.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.user.deleteMany();

    await prisma.household.updateMany({ data: { headOfFamilyId: null } });
    await prisma.resident.deleteMany();
    await prisma.household.deleteMany();

    // ================= HASH PASSWORD =================
    const adminHash = await hashPassword('admin123');
    const wargaHash = await hashPassword('123456');

    // =================================================
    // =================== ADMIN (RT) ==================
    // =================================================

    const adminResident = await prisma.resident.create({
        data: {
            nik: '3201010000000001',
            name: 'Admin RT',
            phone: '081111111111',
            familyRole: 'KEPALA_KELUARGA',
            household: {
                create: {
                    kkNumber: '3201010000000001',
                    address: 'Jl. Mawar No. 1',
                    block: 'A',
                    houseNumber: '1',
                    ownershipType: 'OWNER',
                },
            },
        },
    });

    await prisma.household.update({
        where: { id: adminResident.householdId },
        data: { headOfFamilyId: adminResident.id },
    });

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@gmail.com',
            name: 'Admin',
            password: adminHash,
            role: 'RT',
            residentId: adminResident.id,
        },
    });

    await prisma.account.create({
        data: {
            userId: adminUser.id,
            accountId: adminUser.id,
            providerId: 'credential',
            password: adminHash,
        },
    });

    // =================================================
    // =================== 10 WARGA ====================
    // =================================================

    const wargaList: { resident: any; user: any }[] = [];

    for (let i = 1; i <= 10; i++) {
        const nik = `32010100000000${100 + i}`;
        const email = `warga${i}@gmail.com`;

        const resident = await prisma.resident.create({
            data: {
                nik,
                name: `Warga ${i}`,
                phone: `08123${100000 + i}`,
                familyRole: 'KEPALA_KELUARGA',
                household: {
                    create: {
                        kkNumber: nik,
                        address: `Jl. Melati No. ${i}`,
                        block: String.fromCharCode(65 + (i % 5)),
                        houseNumber: `${10 + i}`,
                        ownershipType: i % 2 === 0 ? 'OWNER' : 'TENANT',
                    },
                },
            },
        });

        await prisma.household.update({
            where: { id: resident.householdId },
            data: { headOfFamilyId: resident.id },
        });

        const user = await prisma.user.create({
            data: {
                email,
                name: `Warga ${i}`,
                password: wargaHash,
                role: 'WARGA',
                residentId: resident.id,
            },
        });

        await prisma.account.create({
            data: {
                userId: user.id,
                accountId: user.id,
                providerId: 'credential',
                password: wargaHash,
            },
        });

        wargaList.push({ resident, user });
    }

    // =================================================
    // ================= IPL PAYMENTS ==================
    // =================================================
    // VERIFIED: 3 warga
    // PENDING : 3 warga
    // REJECTED: 2 warga
    // UNPAID  : 2 warga (tidak dibuat record)

    for (let i = 0; i < wargaList.length; i++) {
        const warga = wargaList[i];

        // Extra safety: IPL hanya untuk WARGA
        if (warga.user.role !== 'WARGA') continue;

        // Last 2 warga = UNPAID
        if (i >= 8) continue;

        let status: any = 'PENDING';
        if (i < 3) status = 'VERIFIED';
        else if (i >= 6) status = 'REJECTED';

        await prisma.iPLPayment.create({
            data: {
                householdId: warga.resident.householdId,
                month: 2,
                year: 2026,
                amount: 350000,
                status,
                proofImage: 'https://via.placeholder.com/300?text=Bukti+Bayar',
                notes: status === 'REJECTED' ? 'Bukti transfer buram' : null,
                verifiedAt: status === 'VERIFIED' ? new Date() : null,
                verifiedBy: status === 'VERIFIED' ? adminUser.id : null,
            },
        });
    }

    console.log('✅ Seed completed!');
    console.log('');
    console.log('👤 Admin (RT)');
    console.log('   email: admin@gmail.com');
    console.log('   password: admin123');
    console.log('');
    console.log('👥 10 Warga');
    console.log('   email: warga1@gmail.com - warga10@gmail.com');
    console.log('   password: 123456');
    console.log('');
    console.log('💰 IPL:');
    console.log('   3 VERIFIED');
    console.log('   3 PENDING');
    console.log('   2 REJECTED');
    console.log('   2 UNPAID');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });