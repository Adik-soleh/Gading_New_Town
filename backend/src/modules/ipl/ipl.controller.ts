import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { IPLService } from './ipl.service';
import { CreateIPLPaymentDto, VerifyIPLDto, RejectIPLDto } from './dto/ipl.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@Controller('api/ipl')
@UseGuards(AuthGuard)
export class IPLController {
    constructor(private iplService: IPLService) { }

    @Get()
    async findAll(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('block') block?: string,
        @Query('month') month?: string,
        @Query('year') year?: string,
    ) {
        return this.iplService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            status,
            block,
            month: month ? parseInt(month) : undefined,
            year: year ? parseInt(year) : undefined,
            user: (req as any).user,
        });
    }

    @Get('summary')
    async getSummary(
        @Req() req: Request,
        @Query('month') month?: string,
        @Query('year') year?: string,
    ) {
        const now = new Date();
        return this.iplService.getSummary(
            month ? parseInt(month) : now.getMonth() + 1,
            year ? parseInt(year) : now.getFullYear(),
            (req as any).user,
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.iplService.findOne(parseInt(id));
    }

    @Post()
    async create(@Body() dto: CreateIPLPaymentDto, @Req() req: Request) {
        return this.iplService.create(dto, (req as any).user);
    }

    @Patch(':id/verify')
    @Roles('RT')
    async verify(@Param('id') id: string, @Body() dto: VerifyIPLDto, @Req() req: Request) {
        return this.iplService.verify(parseInt(id), dto, (req as any).user?.id);
    }

    @Patch(':id/reject')
    @Roles('RT')
    async reject(@Param('id') id: string, @Body() dto: RejectIPLDto, @Req() req: Request) {
        return this.iplService.reject(parseInt(id), dto, (req as any).user?.id);
    }
}
