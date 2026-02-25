import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityLogService {
    constructor(private prisma: PrismaService) { }

    async log(data: {
        action: string;
        category: string;
        reference?: string;
        userId?: string;
    }) {
        return this.prisma.activityLog.create({ data });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
    }) {
        const { page = 1, limit = 10, search, category, startDate, endDate } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { action: { contains: search, mode: 'insensitive' } },
                { reference: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (category) {
            where.category = category;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [data, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where,
                include: { user: { select: { id: true, name: true, role: true, image: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.activityLog.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
