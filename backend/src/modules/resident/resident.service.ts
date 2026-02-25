import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CreateResidentDto, UpdateResidentDto } from './dto/resident.dto';

@Injectable()
export class ResidentService {
    constructor(
        private prisma: PrismaService,
        private logService: ActivityLogService,
    ) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        householdId?: number;
        user?: any;
    }) {
        const { page = 1, limit = 10, search, status, householdId, user } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { nik: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status) where.status = status;
        if (householdId) where.householdId = householdId;

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            if (!household) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
            // Ensure resident can only see members of their own household
            where.householdId = household.id;
        }

        const [data, total] = await Promise.all([
            this.prisma.resident.findMany({
                where,
                include: {
                    household: { select: { id: true, kkNumber: true, block: true, houseNumber: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.resident.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: number, user?: any) {
        const where: any = { id };

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            if (!household) throw new NotFoundException('Resident not found');
            where.householdId = household.id;
        }

        const resident = await this.prisma.resident.findFirst({
            where,
            include: { household: true, mutations: { orderBy: { createdAt: 'desc' } } },
        });
        if (!resident) throw new NotFoundException('Resident not found');
        return resident;
    }

    async create(dto: CreateResidentDto, userId?: string) {
        const resident = await this.prisma.resident.create({
            data: dto,
            include: { household: true },
        });

        await this.logService.log({
            action: `Added new resident: ${dto.name} (NIK: ${dto.nik})`,
            category: 'Data Entry',
            reference: `RES-${resident.id}`,
            userId,
        });

        return resident;
    }

    async update(id: number, dto: UpdateResidentDto, userId?: string) {
        const existing = await this.prisma.resident.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Resident not found');

        const resident = await this.prisma.resident.update({
            where: { id },
            data: dto,
            include: { household: true },
        });

        await this.logService.log({
            action: `Updated resident data for ${resident.name}`,
            category: 'Data Entry',
            reference: `RES-${resident.id}`,
            userId,
        });

        return resident;
    }

    async remove(id: number, userId?: string) {
        const existing = await this.prisma.resident.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Resident not found');

        await this.prisma.resident.delete({ where: { id } });

        await this.logService.log({
            action: `Removed resident: ${existing.name}`,
            category: 'Data Entry',
            reference: `RES-${id}`,
            userId,
        });

        return { message: 'Resident deleted successfully' };
    }
}
