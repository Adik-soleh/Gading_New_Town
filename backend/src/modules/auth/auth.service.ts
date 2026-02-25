import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer } from 'better-auth/plugins';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    public auth: ReturnType<typeof betterAuth>;

    constructor(private prisma: PrismaService) {
        this.auth = betterAuth({
            plugins: [bearer({ requireSignature: false })],
            database: prismaAdapter(prisma, {
                provider: 'postgresql',
            }),
            secret: process.env.BETTER_AUTH_SECRET,
            baseURL: process.env.BETTER_AUTH_URL,
            trustedOrigins: ['http://localhost:5173'],
            emailAndPassword: {
                enabled: true,
            },
            socialProviders: {
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID || '',
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                },
                facebook: {
                    clientId: process.env.FACEBOOK_CLIENT_ID || '',
                    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
                },
            },
            user: {
                additionalFields: {
                    role: {
                        type: 'string',
                        defaultValue: 'WARGA',
                        input: true,
                    },
                },
            },
        });
    }

    async getSession(headers: Headers) {
        const session = await this.auth.api.getSession({ headers });
        return session;
    }

    async loginWithNik(nik: string) {
        // Find resident
        const resident = await this.prisma.resident.findUnique({
            where: { nik },
            include: { user: true }
        });

        if (!resident) {
            throw new UnauthorizedException('NIK tidak ditemukan.');
        }

        if (resident.familyRole !== 'KEPALA_KELUARGA') {
            throw new UnauthorizedException('Hanya Kepala Keluarga yang dapat login menggunakan NIK.');
        }

        if (!resident.user) {
            throw new UnauthorizedException('Warga ini belum memiliki akun yang terdaftar.');
        }

        if (resident.user.role === 'RT') {
            throw new UnauthorizedException('Akun RT tidak dapat login melalui jalur ini.');
        }

        // Generate a new session token for better-auth
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        const session = await this.prisma.session.create({
            data: {
                userId: resident.user.id,
                token,
                expiresAt,
            }
        });

        const { password, ...userWithoutPassword } = resident.user;

        return {
            token,
            user: userWithoutPassword
        };
    }
}
