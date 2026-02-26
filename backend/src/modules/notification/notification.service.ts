import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) { }

    /**
     * Create a notification for a specific user (usually RT)
     */
    async create(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        referenceId?: string;
    }) {
        return this.prisma.notification.create({ data });
    }

    /**
     * Notify all RTs managing a specific household
     */
    async notifyHouseholdRT(householdId: number, data: {
        type: string;
        title: string;
        message: string;
        referenceId?: string;
    }) {
        const household = await this.prisma.household.findUnique({
            where: { id: householdId },
            select: { rtId: true },
        });

        if (household?.rtId) {
            await this.create({
                userId: household.rtId,
                ...data,
            });
        }
    }

    /**
     * Notify all residents (WARGA) in a specific household
     */
    async notifyHouseholdWarga(householdId: number, data: {
        type: string;
        title: string;
        message: string;
        referenceId?: string;
    }) {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'WARGA',
                resident: {
                    householdId: householdId
                }
            },
            select: { id: true },
        });

        if (users.length > 0) {
            await this.prisma.notification.createMany({
                data: users.map((u) => ({
                    userId: u.id,
                    ...data,
                })),
            });
        }
    }

    /**
     * Notify all RT users (for reports which are not household-scoped)
     */
    async notifyAllRTs(data: {
        type: string;
        title: string;
        message: string;
        referenceId?: string;
    }) {
        const rtUsers = await this.prisma.user.findMany({
            where: { role: 'RT' },
            select: { id: true },
        });

        if (rtUsers.length > 0) {
            await this.prisma.notification.createMany({
                data: rtUsers.map((rt) => ({
                    userId: rt.id,
                    ...data,
                })),
            });
        }
    }

    /**
     * Get notifications for a user
     */
    async findAll(userId: string, params: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
    } = {}) {
        const { page = 1, limit = 20, unreadOnly = false } = params;
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (unreadOnly) where.isRead = false;

        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }

    /**
     * Mark one notification as read
     */
    async markAsRead(id: number, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true },
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}
