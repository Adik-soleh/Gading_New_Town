import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CreatePermitDto, ApprovePermitDto, RejectPermitDto, UpdatePermitDto } from './dto/permit.dto';
import { PermitStatus } from '@prisma/client';

@Injectable()
export class PermitService {
    constructor(
        private prisma: PrismaService,
        private logService: ActivityLogService,
    ) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        status?: string;
        sort?: string;
        user?: any;
    }) {
        const { page = 1, limit = 10, status, sort, user } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            if (!household) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
            // Ensure resident can only see permits of their own household
            where.householdId = household.id;
        }

        const orderBy: any = sort === 'name'
            ? { household: { headOfFamily: { name: 'asc' } } }
            : sort === 'status'
                ? { status: 'asc' }
                : { createdAt: 'desc' };

        const [data, total] = await Promise.all([
            this.prisma.renovationPermit.findMany({
                where,
                include: {
                    household: {
                        include: { headOfFamily: { select: { id: true, name: true } } },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.renovationPermit.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async getStats(user?: any) {
        const where: any = {};

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            if (!household) return { pending: 0, approved: 0, rejected: 0, total: 0 };
            where.householdId = household.id;
        }

        const [pending, approved, rejected, total] = await Promise.all([
            this.prisma.renovationPermit.count({ where: { ...where, status: PermitStatus.PENDING } }),
            this.prisma.renovationPermit.count({ where: { ...where, status: PermitStatus.APPROVED } }),
            this.prisma.renovationPermit.count({ where: { ...where, status: PermitStatus.REJECTED } }),
            this.prisma.renovationPermit.count({ where }),
        ]);

        return { pending, approved, rejected, total };
    }

    async findOne(id: number, user?: any) {
        const where: any = { id };

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            if (!household) throw new NotFoundException('Permit not found');
            where.householdId = household.id;
        }

        const permit = await this.prisma.renovationPermit.findFirst({
            where,
            include: { household: { include: { headOfFamily: true } } },
        });
        if (!permit) throw new NotFoundException('Permit not found');
        return permit;
    }

    async create(dto: CreatePermitDto, user?: any) {
        let householdId = dto.householdId;

        if (!householdId && user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
            });
            if (!household) throw new NotFoundException('Household not found for the user');
            householdId = household.id;
        }

        if (!householdId) {
            throw new BadRequestException('Household ID is required');
        }

        const permit = await this.prisma.renovationPermit.create({
            data: {
                householdId,
                category: dto.category,
                description: dto.description,
                startDate: new Date(dto.startDate),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                attachment: dto.attachment,
            },
            include: { household: { include: { headOfFamily: true } } },
        });

        await this.logService.log({
            action: `New permit request: ${dto.category} for Block ${permit.household.block}-${permit.household.houseNumber}`,
            category: 'Permits',
            reference: `PRM-${permit.id}`,
            userId: user?.id,
        });

        return permit;
    }

    async update(id: number, dto: UpdatePermitDto, user?: any) {
        const permit = await this.findOne(id, user);
        if (permit.status !== PermitStatus.PENDING) {
            throw new BadRequestException('Only pending permits can be updated');
        }

        const updated = await this.prisma.renovationPermit.update({
            where: { id },
            data: {
                category: dto.category,
                description: dto.description,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                attachment: dto.attachment,
            },
        });

        await this.logService.log({
            action: `Updated permit request: ${updated.category} for Block ${permit.household.block}-${permit.household.houseNumber}`,
            category: 'Permits',
            reference: `PRM-${updated.id}`,
            userId: user?.id,
        });

        return updated;
    }

    async remove(id: number, user?: any) {
        const permit = await this.findOne(id, user);
        if (permit.status !== PermitStatus.PENDING && user?.role === 'WARGA') {
            throw new BadRequestException('Only pending permits can be deleted by Warga');
        }

        await this.prisma.renovationPermit.delete({
            where: { id },
        });

        await this.logService.log({
            action: `Deleted permit request: ${permit.category} for Block ${permit.household.block}-${permit.household.houseNumber}`,
            category: 'Permits',
            reference: `PRM-${permit.id}`,
            userId: user?.id,
        });

        return { success: true };
    }

    async approve(id: number, dto: ApprovePermitDto, userId?: string) {
        const permit = await this.prisma.renovationPermit.findUnique({
            where: { id },
            include: { household: { include: { headOfFamily: true } } },
        });
        if (!permit) throw new NotFoundException('Permit not found');

        const updated = await this.prisma.renovationPermit.update({
            where: { id },
            data: { status: PermitStatus.APPROVED, rtNotes: dto.rtNotes },
        });

        await this.logService.log({
            action: `Approved permit: ${permit.category} for ${permit.household.headOfFamily?.name || 'Block ' + permit.household.block}`,
            category: 'Permits',
            reference: `PRM-${permit.id}`,
            userId,
        });

        return updated;
    }

    async reject(id: number, dto: RejectPermitDto, userId?: string) {
        const permit = await this.prisma.renovationPermit.findUnique({
            where: { id },
            include: { household: { include: { headOfFamily: true } } },
        });
        if (!permit) throw new NotFoundException('Permit not found');

        const updated = await this.prisma.renovationPermit.update({
            where: { id },
            data: { status: PermitStatus.REJECTED, rtNotes: dto.rtNotes },
        });

        await this.logService.log({
            action: `Rejected permit: ${permit.category} for ${permit.household.headOfFamily?.name || 'Block ' + permit.household.block}`,
            category: 'Permits',
            reference: `PRM-${permit.id}`,
            userId,
        });

        return updated;
    }
}
