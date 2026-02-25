import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus, PermitStatus, ReportStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getStats(user: any) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (user?.role === 'WARGA') {
            // For WARGA, fetch only their specific stats
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });

            if (!household) {
                return {
                    activeFamilies: 0,
                    unpaidIPL: 0,
                    pendingVerifications: 0,
                    pendingPermits: 0,
                };
            }

            // Instead of just checking non-verified statuses, we check if the current month's IPL is NOT verified.
            // If it's missing entirely or not VERIFIED, we count it as 1 unpaid month (simplified logic for dashboard).
            const currentPayment = await this.prisma.iPLPayment.findFirst({
                where: {
                    householdId: household.id,
                    month: currentMonth,
                    year: currentYear,
                },
            });

            const unpaidIPL = currentPayment?.status === PaymentStatus.VERIFIED ? 0 : 1;

            const pendingPermits = await this.prisma.renovationPermit.count({
                where: {
                    householdId: household.id,
                    status: PermitStatus.PENDING,
                },
            });

            const activeReports = await this.prisma.report.count({
                where: {
                    reporterId: user.id,
                    status: { in: [ReportStatus.NEW, ReportStatus.IN_PROGRESS] },
                },
            });

            return {
                activeFamilies: 1, // Defaulting to 1 for their own family
                unpaidIPL,
                pendingVerifications: 0, // Residents don't verify
                pendingPermits,
                activeReports,
            };
        }

        const [
            activeFamilies,
            unpaidIPL,
            pendingVerifications,
            pendingPermits,
        ] = await Promise.all([
            this.prisma.household.count({
                where: {
                    NOT: { residents: { some: { user: { role: 'RT' } } } }
                }
            }),
            this.prisma.household.count({
                where: {
                    NOT: { residents: { some: { user: { role: 'RT' } } } },
                    payments: {
                        none: {
                            month: currentMonth,
                            year: currentYear,
                            status: PaymentStatus.VERIFIED,
                        },
                    },
                },
            }),
            this.prisma.iPLPayment.count({
                where: { status: PaymentStatus.PENDING },
            }),
            this.prisma.renovationPermit.count({
                where: { status: PermitStatus.PENDING },
            }),
        ]);

        return {
            activeFamilies,
            unpaidIPL,
            pendingVerifications,
            pendingPermits,
        };
    }

    async getIPLChart(year: number, user?: any) {
        const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const totalHouseholds = await this.prisma.household.count({
            where: {
                NOT: { residents: { some: { user: { role: 'RT' } } } }
            }
        });

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });

            if (!household) return [];

            return Promise.all(
                months.map(async (month) => {
                    const payment = await this.prisma.iPLPayment.findFirst({
                        where: { householdId: household.id, month, year },
                    });

                    let paid = 0, pending = 0, unpaid = 0;
                    if (payment?.status === PaymentStatus.VERIFIED) paid = 100;
                    else if (payment?.status === PaymentStatus.PENDING) pending = 100;
                    else unpaid = 100;

                    return { month, paid, pending, unpaid };
                })
            );
        }

        const chartData = await Promise.all(
            months.map(async (month) => {
                const [paid, pending] = await Promise.all([
                    this.prisma.iPLPayment.count({
                        where: { month, year, status: PaymentStatus.VERIFIED },
                    }),
                    this.prisma.iPLPayment.count({
                        where: { month, year, status: PaymentStatus.PENDING },
                    }),
                ]);

                const unpaid = totalHouseholds - paid - pending;

                return {
                    month,
                    paid: totalHouseholds > 0 ? Math.round((paid / totalHouseholds) * 100) : 0,
                    pending: totalHouseholds > 0 ? Math.round((pending / totalHouseholds) * 100) : 0,
                    unpaid: totalHouseholds > 0 ? Math.round((Math.max(0, unpaid) / totalHouseholds) * 100) : 0,
                };
            }),
        );

        return chartData;
    }

    async getRecentActivity(limit = 10, user?: any) {
        const where = user?.role === 'WARGA' ? { userId: user.id } : {};
        return this.prisma.activityLog.findMany({
            where,
            include: { user: { select: { id: true, name: true, role: true, image: true } } },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}
