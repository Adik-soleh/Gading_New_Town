import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { PermitService } from './permit.service';
import { CreatePermitDto, ApprovePermitDto, RejectPermitDto, UpdatePermitDto } from './dto/permit.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@Controller('api/permits')
@UseGuards(AuthGuard)
export class PermitController {
    constructor(private permitService: PermitService) { }

    @Get()
    async findAll(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
        @Query('sort') sort?: string,
    ) {
        return this.permitService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            status,
            sort,
            user: (req as any).user,
        });
    }

    @Get('stats')
    async getStats(@Req() req: Request) {
        return this.permitService.getStats((req as any).user);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: Request) {
        return this.permitService.findOne(parseInt(id), (req as any).user);
    }

    @Post()
    async create(@Body() dto: CreatePermitDto, @Req() req: Request) {
        return this.permitService.create(dto, (req as any).user);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdatePermitDto, @Req() req: Request) {
        return this.permitService.update(parseInt(id), dto, (req as any).user);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: Request) {
        return this.permitService.remove(parseInt(id), (req as any).user);
    }

    @Patch(':id/approve')
    @Roles('RT')
    async approve(@Param('id') id: string, @Body() dto: ApprovePermitDto, @Req() req: Request) {
        return this.permitService.approve(parseInt(id), dto, (req as any).user?.id);
    }

    @Patch(':id/reject')
    @Roles('RT')
    async reject(@Param('id') id: string, @Body() dto: RejectPermitDto, @Req() req: Request) {
        return this.permitService.reject(parseInt(id), dto, (req as any).user?.id);
    }
}
