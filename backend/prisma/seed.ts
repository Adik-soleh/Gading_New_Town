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
    console.log('🌱 Seeding database (Multi-RT)...');

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

    // ================= HASH PASSWORDS =================
    const adminHash = await hashPassword('admin123');
    const wargaHash = await hashPassword('123456');

    // =================================================
    // =================== RT 1 ========================
    // =================================================

    const rt1Resident = await prisma.resident.create({
        data: {
            nik: '3201010000000001',
            name: 'Pak Budi (RT 1)',
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
        where: { id: rt1Resident.householdId },
        data: { headOfFamilyId: rt1Resident.id },
    });

    const rt1User = await prisma.user.create({
        data: {
            email: 'admin@gmail.com',
            name: 'Pak Budi (RT 1)',
            password: adminHash,
            role: 'RT',
            residentId: rt1Resident.id,
        },
    });

    await prisma.account.create({
        data: {
            userId: rt1User.id,
            accountId: rt1User.id,
            providerId: 'credential',
            password: adminHash,
        },
    });

    // Assign RT1's own household to themselves
    await prisma.household.update({
        where: { id: rt1Resident.householdId },
        data: { rtId: rt1User.id },
    });

    // =================================================
    // =================== RT 2 ========================
    // =================================================

    const rt2Resident = await prisma.resident.create({
        data: {
            nik: '3201010000000002',
            name: 'Pak Rudi (RT 2)',
            phone: '081222222222',
            familyRole: 'KEPALA_KELUARGA',
            household: {
                create: {
                    kkNumber: '3201010000000002',
                    address: 'Jl. Dahlia No. 1',
                    block: 'B',
                    houseNumber: '1',
                    ownershipType: 'OWNER',
                },
            },
        },
    });

    await prisma.household.update({
        where: { id: rt2Resident.householdId },
        data: { headOfFamilyId: rt2Resident.id },
    });

    const rt2User = await prisma.user.create({
        data: {
            email: 'admin2@gmail.com',
            name: 'Pak Rudi (RT 2)',
            password: adminHash,
            role: 'RT',
            residentId: rt2Resident.id,
        },
    });

    await prisma.account.create({
        data: {
            userId: rt2User.id,
            accountId: rt2User.id,
            providerId: 'credential',
            password: adminHash,
        },
    });

    // Assign RT2's own household to themselves
    await prisma.household.update({
        where: { id: rt2Resident.householdId },
        data: { rtId: rt2User.id },
    });

    // =================================================
    // =========== 5 WARGA for RT 1 (Block A) ==========
    // =================================================

    const rt1WargaNames = [
        { kk: 'Ahmad Santoso', members: ['Siti Aminah', 'Dian Santoso'] },
        { kk: 'Bambang Wijaya', members: ['Rina Wijaya', 'Eko Wijaya'] },
        { kk: 'Cahyo Purnomo', members: ['Dewi Purnomo', 'Faisal Purnomo'] },
        { kk: 'Darmawan Suharto', members: ['Lestari Suharto', 'Gilang Suharto'] },
        { kk: 'Eko Prasetyo', members: ['Maya Prasetyo', 'Hendra Prasetyo'] },
    ];

    const rt1Warga: { resident: any; user: any }[] = [];

    for (let i = 0; i < rt1WargaNames.length; i++) {
        const w = rt1WargaNames[i];
        const nik = `32010100000001${10 + i}`;
        const email = `warga${i + 1}@gmail.com`;

        const resident = await prisma.resident.create({
            data: {
                nik,
                name: w.kk,
                phone: `08123${200000 + i}`,
                familyRole: 'KEPALA_KELUARGA',
                household: {
                    create: {
                        kkNumber: nik,
                        address: `Jl. Melati No. ${i + 2}`,
                        block: 'A',
                        houseNumber: `${i + 2}`,
                        ownershipType: i % 2 === 0 ? 'OWNER' : 'TENANT',
                        rtId: rt1User.id, // Managed by RT1
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
                name: w.kk,
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

        // Add family members (2 per household)
        for (let j = 0; j < w.members.length; j++) {
            await prisma.resident.create({
                data: {
                    nik: `320101000010${String(i + 1).padStart(2, '0')}${j + 1}`,
                    name: w.members[j],
                    phone: `08199${300000 + i * 10 + j}`,
                    familyRole: j === 0 ? 'ISTRI' : 'ANAK',
                    householdId: resident.householdId,
                },
            });
        }

        rt1Warga.push({ resident, user });
    }

    // =================================================
    // =========== 3 WARGA for RT 2 (Block B) ==========
    // =================================================

    const rt2WargaNames = [
        { kk: 'Fajar Hidayat', members: ['Nur Hidayat'] },
        { kk: 'Gunawan Susilo', members: ['Ratna Susilo'] },
        { kk: 'Haris Pratama', members: ['Wulan Pratama'] },
    ];

    const rt2Warga: { resident: any; user: any }[] = [];

    for (let i = 0; i < rt2WargaNames.length; i++) {
        const w = rt2WargaNames[i];
        const nik = `32010100000002${10 + i}`;
        const email = `wargab${i + 1}@gmail.com`;

        const resident = await prisma.resident.create({
            data: {
                nik,
                name: w.kk,
                phone: `08124${400000 + i}`,
                familyRole: 'KEPALA_KELUARGA',
                household: {
                    create: {
                        kkNumber: nik,
                        address: `Jl. Anggrek No. ${i + 2}`,
                        block: 'B',
                        houseNumber: `${i + 2}`,
                        ownershipType: 'OWNER',
                        rtId: rt2User.id, // Managed by RT2
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
                name: w.kk,
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

        // Add family members (1 per household)
        for (let j = 0; j < w.members.length; j++) {
            await prisma.resident.create({
                data: {
                    nik: `320101000020${String(i + 1).padStart(2, '0')}${j + 1}`,
                    name: w.members[j],
                    phone: `08199${500000 + i * 10 + j}`,
                    familyRole: 'ISTRI',
                    householdId: resident.householdId,
                },
            });
        }

        rt2Warga.push({ resident, user });
    }

    // =================================================
    // ========= IPL PAYMENTS — RT1 Warga ==============
    // =================================================
    // 2 VERIFIED, 1 PENDING, 1 REJECTED, 1 UNPAID

    const rt1Statuses = ['VERIFIED', 'VERIFIED', 'PENDING', 'REJECTED', null]; // null = UNPAID
    for (let i = 0; i < rt1Warga.length; i++) {
        const status = rt1Statuses[i];
        if (!status) continue; // UNPAID = no record

        await prisma.iPLPayment.create({
            data: {
                householdId: rt1Warga[i].resident.householdId,
                month: 2,
                year: 2026,
                amount: 350000,
                status: status as any,
                proofImage: 'https://via.placeholder.com/300?text=Bukti+Bayar',
                notes: status === 'REJECTED' ? 'Bukti transfer buram, silakan upload ulang' : null,
                verifiedAt: status === 'VERIFIED' ? new Date() : null,
                verifiedBy: status === 'VERIFIED' ? rt1User.id : null,
            },
        });
    }

    // =================================================
    // ========= IPL PAYMENTS — RT2 Warga ==============
    // =================================================
    // 1 VERIFIED, 1 PENDING, 1 UNPAID

    const rt2Statuses = ['VERIFIED', 'PENDING', null]; // null = UNPAID
    for (let i = 0; i < rt2Warga.length; i++) {
        const status = rt2Statuses[i];
        if (!status) continue; // UNPAID = no record

        await prisma.iPLPayment.create({
            data: {
                householdId: rt2Warga[i].resident.householdId,
                month: 2,
                year: 2026,
                amount: 250000,
                status: status as any,
                proofImage: 'https://via.placeholder.com/300?text=Bukti+Bayar',
                verifiedAt: status === 'VERIFIED' ? new Date() : null,
                verifiedBy: status === 'VERIFIED' ? rt2User.id : null,
            },
        });
    }

    // =================================================
    // ========= RENOVATION PERMITS ====================
    // =================================================

    // RT1 - 1 permit (PENDING)
    await prisma.renovationPermit.create({
        data: {
            householdId: rt1Warga[0].resident.householdId,
            category: 'Renovasi Atap',
            description: 'Mengganti atap rumah yang bocor',
            startDate: new Date('2026-03-01'),
            endDate: new Date('2026-03-15'),
        },
    });

    // RT2 - 1 permit (PENDING)
    await prisma.renovationPermit.create({
        data: {
            householdId: rt2Warga[0].resident.householdId,
            category: 'Pagar Depan',
            description: 'Memasang pagar baru di depan rumah',
            startDate: new Date('2026-03-05'),
            endDate: new Date('2026-04-05'),
        },
    });

    // =================================================
    // =============== PRINT SUMMARY ===================
    // =================================================

    console.log('');
    console.log('✅ Seed completed! Multi-RT structure:');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 RT 1 — Pak Budi');
    console.log('   email: admin@gmail.com');
    console.log('   password: admin123');
    console.log('   Mengelola: 5 KK (Block A)');
    console.log('   Masing-masing KK: 1 KK + 2 anggota = 3 orang');
    console.log('   IPL: 2 VERIFIED, 1 PENDING, 1 REJECTED, 1 UNPAID');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 RT 2 — Pak Rudi');
    console.log('   email: admin2@gmail.com');
    console.log('   password: admin123');
    console.log('   Mengelola: 3 KK (Block B)');
    console.log('   Masing-masing KK: 1 KK + 1 anggota = 2 orang');
    console.log('   IPL: 1 VERIFIED, 1 PENDING, 1 UNPAID');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 Warga RT1:');
    rt1Warga.forEach((w, i) => console.log(`   ${i + 1}. ${w.resident.name} - NIK: ${w.resident.nik} - email: warga${i + 1}@gmail.com`));
    console.log('');
    console.log('👥 Warga RT2:');
    rt2Warga.forEach((w, i) => console.log(`   ${i + 1}. ${w.resident.name} - NIK: ${w.resident.nik} - email: wargab${i + 1}@gmail.com`));
    console.log('');
    console.log('🔑 Password semua Warga: 123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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