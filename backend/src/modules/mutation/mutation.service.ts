import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationService } from '../notification/notification.service';
import { CreateMutationDto } from './dto/mutation.dto';
import { MutationStatus, MutationType } from '@prisma/client';

@Injectable()
export class MutationService {
    constructor(
        private prisma: PrismaService,
        private logService: ActivityLogService,
        private notificationService: NotificationService,
    ) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
        user?: any;
    }) {
        const { page = 1, limit = 10, type, status, user } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (type) where.type = type;
        if (status) where.status = status;

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
                include: { residents: { select: { id: true } } }
            });
            if (!household) return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
            const residentIds = household.residents.map(r => r.id);
            where.residentId = { in: residentIds };
        } else if (user?.role === 'RT') {
            // RT only sees mutations from their managed households
            where.resident = { household: { rtId: user.id } };
        }

        const [data, total] = await Promise.all([
            this.prisma.mutation.findMany({
                where,
                include: { resident: { include: { household: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.mutation.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async getStats(user?: any) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const where: any = { date: { gte: startOfMonth } };

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
                include: { residents: { select: { id: true } } }
            });
            if (!household) return { total: 0, incoming: 0, outgoing: 0, pendingIncoming: 0 };
            const residentIds = household.residents.map(r => r.id);
            where.residentId = { in: residentIds };
        } else if (user?.role === 'RT') {
            where.resident = { household: { rtId: user.id } };
        }

        const [total, incoming, outgoing] = await Promise.all([
            this.prisma.mutation.count({ where }),
            this.prisma.mutation.count({ where: { ...where, type: MutationType.PINDAH_MASUK } }),
            this.prisma.mutation.count({ where: { ...where, type: MutationType.PINDAH_KELUAR } }),
        ]);

        const pendingIncoming = await this.prisma.mutation.count({
            where: { ...where, type: MutationType.PINDAH_MASUK, status: MutationStatus.PENDING },
        });

        return { total, incoming, outgoing, pendingIncoming };
    }

    async findOne(id: number, user?: any) {
        const where: any = { id };

        if (user?.role === 'WARGA') {
            const household = await this.prisma.household.findFirst({
                where: { residents: { some: { user: { id: user.id } } } },
                include: { residents: { select: { id: true } } }
            });
            if (!household) throw new NotFoundException('Mutation record not found');
            const residentIds = household.residents.map(r => r.id);
            // Verify ownership
            where.residentId = { in: residentIds };
        }

        const mutation = await this.prisma.mutation.findFirst({
            where,
            include: { resident: { include: { household: true } } },
        });
        if (!mutation) throw new NotFoundException('Mutation record not found');
        return mutation;
    }

    async create(dto: CreateMutationDto, user?: any) {
        let finalResidentId = dto.residentId;

        // Auto-resolve residentId for WARGA
        if (!finalResidentId && (user?.role === 'WARGA')) {
            const userRecord = await this.prisma.user.findUnique({
                where: { id: user.id },
                select: { residentId: true },
            });
            if (!userRecord?.residentId) {
                throw new NotFoundException('Resident data not found for this user');
            }
            finalResidentId = userRecord.residentId;
        }

        if (!finalResidentId) {
            throw new NotFoundException('Resident ID is required');
        }

        const mutation = await this.prisma.mutation.create({
            data: {
                residentId: finalResidentId,
                type: dto.type,
                date: new Date(dto.date),
                originAddress: dto.originAddress,
                destinationAddress: dto.destinationAddress,
                block: dto.block,
                reason: dto.reason,
                attachment: dto.attachment,
            },
            include: { resident: { include: { household: true } } },
        });

        await this.logService.log({
            action: `New mutation: ${dto.type === 'PINDAH_MASUK' ? 'Incoming' : 'Outgoing'} - ${mutation.resident.name}`,
            category: 'Data Entry',
            reference: `MUT-${mutation.id}`,
            userId: user?.id,
        });

        // Notify RT
        const typeLabel = dto.type === 'PINDAH_MASUK' ? 'Pindah Masuk' : 'Pindah Keluar';
        await this.notificationService.notifyHouseholdRT(mutation.resident.householdId, {
            type: 'MUTATION_REQUEST',
            title: 'Pengajuan Mutasi Baru',
            message: `${mutation.resident.name} mengajukan mutasi ${typeLabel}`,
            referenceId: `MUT-${mutation.id}`,
        });

        return mutation;
    }

    async verify(id: number, userId?: string) {
        const mutation = await this.prisma.mutation.findUnique({
            where: { id },
            include: { resident: true },
        });
        if (!mutation) throw new NotFoundException('Mutation record not found');

        const updated = await this.prisma.mutation.update({
            where: { id },
            data: { status: MutationStatus.VERIFIED },
        });

        // If incoming, update resident status to ACTIVE
        if (mutation.type === MutationType.PINDAH_MASUK) {
            await this.prisma.resident.update({
                where: { id: mutation.residentId },
                data: { status: 'ACTIVE' },
            });
        }

        // If outgoing, update resident status to INACTIVE
        if (mutation.type === MutationType.PINDAH_KELUAR) {
            await this.prisma.resident.update({
                where: { id: mutation.residentId },
                data: { status: 'INACTIVE' },
            });
        }

        await this.logService.log({
            action: `Verified mutation for ${mutation.resident.name} (${mutation.type})`,
            category: 'Data Entry',
            reference: `MUT-${mutation.id}`,
            userId,
        });

        return updated;
    }
}
