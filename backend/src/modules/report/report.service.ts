import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { CreateReportDto, UpdateReportStatusDto, RespondReportDto } from './dto/report.dto';

@Injectable()
export class ReportService {
    constructor(
        private prisma: PrismaService,
        private logService: ActivityLogService,
    ) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        status?: string;
        category?: string;
        sort?: string;
        user?: any;
    }) {
        const { page = 1, limit = 10, status, category, sort, user } = params;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (category) where.category = category;

        if (user?.role === 'WARGA') {
            where.reporterId = user.id;
        }

        const orderBy: any = sort === 'oldest'
            ? { createdAt: 'asc' }
            : { createdAt: 'desc' };

        const [data, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                include: { reporter: { select: { id: true, name: true } } },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.report.count({ where }),
        ]);

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: number, user?: any) {
        const where: any = { id };
        if (user?.role === 'WARGA') {
            where.reporterId = user.id;
        }

        const report = await this.prisma.report.findFirst({
            where,
            include: { reporter: { select: { id: true, name: true } } },
        });
        if (!report) throw new NotFoundException('Report not found');
        return report;
    }

    async create(dto: CreateReportDto, userId?: string) {
        const report = await this.prisma.report.create({
            data: {
                subject: dto.subject,
                description: dto.description,
                category: dto.category,
                reporterId: userId || null,
                reporterName: dto.reporterName || 'Anonymous',
                reporterBlock: dto.reporterBlock,
            },
        });

        await this.logService.log({
            action: `New report: ${dto.subject} (${dto.category})`,
            category: 'Security',
            reference: `RPT-${report.id}`,
            userId,
        });

        return report;
    }

    async updateStatus(id: number, dto: UpdateReportStatusDto, userId?: string) {
        const report = await this.prisma.report.findUnique({ where: { id } });
        if (!report) throw new NotFoundException('Report not found');

        const updated = await this.prisma.report.update({
            where: { id },
            data: { status: dto.status },
        });

        await this.logService.log({
            action: `Updated report "${report.subject}" status to ${dto.status}`,
            category: 'Security',
            reference: `RPT-${report.id}`,
            userId,
        });

        return updated;
    }

    async respond(id: number, dto: RespondReportDto, userId?: string) {
        const report = await this.prisma.report.findUnique({ where: { id } });
        if (!report) throw new NotFoundException('Report not found');

        const updated = await this.prisma.report.update({
            where: { id },
            data: { response: dto.response },
        });

        await this.logService.log({
            action: `Responded to report "${report.subject}"`,
            category: 'Security',
            reference: `RPT-${report.id}`,
            userId,
        });

        return updated;
    }
}
