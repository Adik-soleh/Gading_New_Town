import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CreateHouseholdDto, UpdateHouseholdDto } from './dto/household.dto';

@Injectable()
export class HouseholdService {
    constructor(
        private prisma: PrismaService,
        private logService: ActivityLogService,
    ) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        block?: string;
        user?: any;
    }) {
        const { page = 1, limit = 10, search, block, user } = params;
        const skip = (page - 1) * limit;

        const where: any = {};

        // RT only sees their managed households
        if (user?.role === 'RT' && user?.id) {
            where.rtId = user.id;
        }

        if (search) {
            where.OR = [
                { kkNumber: { contains: search, mode: 'insensitive' } },
                { headOfFamily: { name: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (block) {
            where.block = block;
        }

        const [data, total] = await Promise.all([
            this.prisma.household.findMany({
                where,
                include: {
                    headOfFamily: true,
                    _count: { select: { residents: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.household.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: number) {
        const household = await this.prisma.household.findUnique({
            where: { id },
            include: {
                headOfFamily: true,
                residents: true,
                payments: { orderBy: { createdAt: 'desc' }, take: 5 },
                permits: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
        });

        if (!household) throw new NotFoundException('Household not found');
        return household;
    }

    async create(dto: CreateHouseholdDto, userId?: string) {
        const household = await this.prisma.household.create({ data: dto });

        await this.logService.log({
            action: `Created household KK ${dto.kkNumber} at Block ${dto.block}-${dto.houseNumber}`,
            category: 'Data Entry',
            reference: `HH-${household.id}`,
            userId,
        });

        return household;
    }

    async update(id: number, dto: UpdateHouseholdDto, userId?: string) {
        const existing = await this.prisma.household.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Household not found');

        const household = await this.prisma.household.update({
            where: { id },
            data: dto,
        });

        await this.logService.log({
            action: `Updated household KK ${household.kkNumber}`,
            category: 'Data Entry',
            reference: `HH-${household.id}`,
            userId,
        });

        return household;
    }

    async remove(id: number, userId?: string) {
        const existing = await this.prisma.household.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Household not found');

        await this.prisma.household.delete({ where: { id } });

        await this.logService.log({
            action: `Deleted household KK ${existing.kkNumber}`,
            category: 'Data Entry',
            reference: `HH-${id}`,
            userId,
        });

        return { message: 'Household deleted successfully' };
    }
}
