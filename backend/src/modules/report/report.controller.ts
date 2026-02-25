import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto, UpdateReportStatusDto, RespondReportDto } from './dto/report.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@Controller('api/reports')
@UseGuards(AuthGuard)
export class ReportController {
    constructor(private reportService: ReportService) { }

    @Get()
    async findAll(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('category') category?: string,
        @Query('sort') sort?: string,
    ) {
        return this.reportService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            status,
            category,
            sort,
            user: (req as any).user,
        });
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: Request) {
        return this.reportService.findOne(parseInt(id), (req as any).user);
    }

    @Post()
    async create(@Body() dto: CreateReportDto, @Req() req: Request) {
        return this.reportService.create(dto, (req as any).user?.id);
    }

    @Patch(':id/status')
    @Roles('RT')
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateReportStatusDto, @Req() req: Request) {
        return this.reportService.updateStatus(parseInt(id), dto, (req as any).user?.id);
    }

    @Post(':id/respond')
    @Roles('RT')
    async respond(@Param('id') id: string, @Body() dto: RespondReportDto, @Req() req: Request) {
        return this.reportService.respond(parseInt(id), dto, (req as any).user?.id);
    }
}
