import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ResidentService } from './resident.service';
import { CreateResidentDto, UpdateResidentDto } from './dto/resident.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@Controller('api/residents')
@UseGuards(AuthGuard)
export class ResidentController {
    constructor(private residentService: ResidentService) { }

    @Get()
    async findAll(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('householdId') householdId?: string,
    ) {
        return this.residentService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            search,
            status,
            householdId: householdId ? parseInt(householdId) : undefined,
            user: (req as any).user,
        });
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: Request) {
        return this.residentService.findOne(parseInt(id), (req as any).user);
    }

    @Post()
    async create(@Body() dto: CreateResidentDto, @Req() req: Request) {
        return this.residentService.create(dto, (req as any).user?.id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateResidentDto, @Req() req: Request) {
        return this.residentService.update(parseInt(id), dto, (req as any).user?.id);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: Request) {
        return this.residentService.remove(parseInt(id), (req as any).user?.id);
    }
}
