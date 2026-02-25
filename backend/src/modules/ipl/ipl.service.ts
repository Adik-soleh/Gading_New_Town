import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CreateIPLPaymentDto, VerifyIPLDto, RejectIPLDto } from './dto/ipl.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class IPLService {
    constructor(
        private prisma: PrismaService,
        private logService: ActivityLogService,
    ) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        status?: string; // PENDING, VERIFIED, REJECTED, UNPAID
        block?: string;
        month?: number;
        year?: number;
        user?: any;
    }) {
        const { page = 1, limit = 10, status, block, month, year, user } = params;
        const skip = (page - 1) * limit;

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            if (!household) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };

            const wWhere: any = { householdId: household.id };
            // For Warga history, if status provided we filter 
            if (status) wWhere.status = status;

            const [data, total] = await Promise.all([
                this.prisma.iPLPayment.findMany({
                    where: wWhere,
                    include: {
                        household: {
                            include: { headOfFamily: { select: { id: true, name: true } } },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                this.prisma.iPLPayment.count({ where: wWhere }),
            ]);

            return {
                data,
                meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            };
        }

        // --- ADMIN ROLE ---
        // Admin primarily requests list by month/year. We query Households and join the payment if it exists.
        const hWhere: any = {
            residents: {
                none: { user: { role: 'RT' } }
            }
        };
        if (block) hWhere.block = block;

        if (month && year) {
            if (status === 'UNPAID') {
                hWhere.payments = { none: { month, year, status: { not: PaymentStatus.REJECTED } } };
            } else if (status) {
                hWhere.payments = { some: { month, year, status: status as PaymentStatus } };
            }
        }

        const [households, total] = await Promise.all([
            this.prisma.household.findMany({
                where: hWhere,
                include: {
                    headOfFamily: { select: { id: true, name: true } },
                    payments: month && year ? { where: { month, year } } : false,
                },
                orderBy: { id: 'asc' },
                skip,
                take: limit,
            }),
            this.prisma.household.count({ where: hWhere }),
        ]);

        const data = households.map(h => {
            const payArray = h.payments as any[];
            const payment = payArray && payArray.length > 0 ? payArray[0] : null;

            if (payment) {
                return {
                    ...payment,
                    household: {
                        id: h.id,
                        block: h.block,
                        houseNumber: h.houseNumber,
                        headOfFamily: h.headOfFamily,
                    }
                };
            }

            // Simulate UNPAID record if no payment found
            return {
                id: -(h.id), // negative ID ensures React key uniqueness
                householdId: h.id,
                month: month || new Date().getMonth() + 1,
                year: year || new Date().getFullYear(),
                amount: 250000, // target
                proofImage: null,
                status: 'UNPAID', // Unified literal
                notes: null,
                createdAt: new Date(),
                household: {
                    id: h.id,
                    block: h.block,
                    houseNumber: h.houseNumber,
                    headOfFamily: h.headOfFamily,
                }
            };
        });

        // if status === REJECTED we also want them to fall under unpaid actually? 
        // No, REJECTED is rejected. UNPAID is completely missing or just not paid. Wait, if a payment is REJECTED, it appears in `payments`.

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / (limit || 1)) },
        };
    }

    async getSummary(month: number, year: number, user?: any) {
        const where: any = { month, year };

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            // If they are a WARGA but have no household, return zeros to avoid errors
            if (!household) {
                return {
                    totalCollected: 0, target: 0, paid: 0,
                    pending: 0, unpaid: 0, totalHouseholds: 0, percentage: 0
                };
            }
            where.householdId = household.id;

            // For individuals, we just want to know if they paid, pending, or unpaid this month
            const payment = await this.prisma.iPLPayment.findFirst({ where });
            const paid = payment?.status === PaymentStatus.VERIFIED ? 1 : 0;
            const pending = payment?.status === PaymentStatus.PENDING ? 1 : 0;
            const unpaid = (!payment || payment?.status === PaymentStatus.REJECTED) ? 1 : 0;
            const target = 200000;
            const totalCollected = paid * target;

            return {
                totalCollected,
                target,
                paid,
                pending,
                unpaid,
                totalHouseholds: 1,
                percentage: paid * 100
            };
        }

        const [totalCollected, countByStatus, allHouseholds] = await Promise.all([
            this.prisma.iPLPayment.aggregate({
                where: { ...where, status: PaymentStatus.VERIFIED },
                _sum: { amount: true },
            }),
            this.prisma.iPLPayment.groupBy({
                by: ['status'],
                where,
                _count: true,
            }),
            this.prisma.household.count({
                where: {
                    residents: { none: { user: { role: 'RT' } } }
                }
            }),
        ]);

        const statusCounts = { VERIFIED: 0, PENDING: 0, REJECTED: 0 };
        countByStatus.forEach((g) => {
            statusCounts[g.status] = g._count;
        });

        const paid = statusCounts.VERIFIED;
        const pending = statusCounts.PENDING;
        const unpaid = allHouseholds - paid - pending;
        const targetAmount = allHouseholds * 200000;
        const totalAmount = Number(totalCollected._sum.amount) || 0;

        return {
            totalCollected: totalAmount,
            targetAmount,
            paidCount: paid,
            pendingCount: pending,
            unpaidCount: unpaid > 0 ? unpaid : 0,
            percentage: targetAmount > 0 ? Math.round((totalAmount / targetAmount) * 100) : 0,
        };
    }

    async findOne(id: number) {
        const payment = await this.prisma.iPLPayment.findUnique({
            where: { id },
            include: {
                household: {
                    include: { headOfFamily: true },
                },
            },
        });
        if (!payment) throw new NotFoundException('Payment not found');
        return payment;
    }

    async create(dto: CreateIPLPaymentDto, user?: any) {
        let finalHouseholdId = dto.householdId;

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            if (!household) throw new BadRequestException('Bukan anggota dari kartu keluarga manapun.');
            finalHouseholdId = household.id;
        }

        if (!finalHouseholdId) {
            throw new BadRequestException('Household ID is required');
        }

        const existing = await this.prisma.iPLPayment.findUnique({
            where: {
                householdId_month_year: {
                    householdId: finalHouseholdId,
                    month: dto.month,
                    year: dto.year,
                },
            },
        });

        if (existing) {
            if (existing.status === PaymentStatus.VERIFIED || existing.status === PaymentStatus.PENDING) {
                throw new BadRequestException('Payment record already exists and is pending or verified for this period');
            }

            const payment = await this.prisma.iPLPayment.update({
                where: { id: existing.id },
                data: {
                    amount: dto.amount,
                    proofImage: dto.proofImage,
                    status: PaymentStatus.PENDING,
                },
                include: { household: { include: { headOfFamily: true } } },
            });

            await this.logService.log({
                action: `IPL payment re-submitted for household ${payment.household.kkNumber} (${payment.month}/${payment.year})`,
                category: 'Finance',
                reference: `IPL-${payment.id}`,
                userId: user?.id,
            });

            return payment;
        }

        const payment = await this.prisma.iPLPayment.create({
            data: {
                householdId: finalHouseholdId,
                month: dto.month,
                year: dto.year,
                amount: dto.amount,
                proofImage: dto.proofImage,
            },
            include: { household: { include: { headOfFamily: true } } },
        });

        await this.logService.log({
            action: `IPL payment submitted for household ${payment.household.kkNumber} (${payment.month}/${payment.year})`,
            category: 'Finance',
            reference: `IPL-${payment.id}`,
            userId: user?.id,
        });

        return payment;
    }

    async verify(id: number, dto: VerifyIPLDto, userId?: string) {
        const payment = await this.prisma.iPLPayment.findUnique({
            where: { id },
            include: { household: { include: { headOfFamily: true } } },
        });
        if (!payment) throw new NotFoundException('Payment not found');

        const updated = await this.prisma.iPLPayment.update({
            where: { id },
            data: {
                status: PaymentStatus.VERIFIED,
                notes: dto.notes,
                verifiedAt: new Date(),
                verifiedBy: userId,
            },
        });

        await this.logService.log({
            action: `Verified IPL payment for ${payment.household.headOfFamily?.name || 'KK-' + payment.householdId}`,
            category: 'Finance',
            reference: `IPL-${payment.id}`,
            userId,
        });

        return updated;
    }

    async reject(id: number, dto: RejectIPLDto, userId?: string) {
        const payment = await this.prisma.iPLPayment.findUnique({
            where: { id },
            include: { household: { include: { headOfFamily: true } } },
        });
        if (!payment) throw new NotFoundException('Payment not found');

        const updated = await this.prisma.iPLPayment.update({
            where: { id },
            data: {
                status: PaymentStatus.REJECTED,
                notes: dto.notes,
            },
        });

        await this.logService.log({
            action: `Rejected IPL payment for ${payment.household.headOfFamily?.name || 'KK-' + payment.householdId}: ${dto.notes}`,
            category: 'Finance',
            reference: `IPL-${payment.id}`,
            userId,
        });

        return updated;
    }
}
