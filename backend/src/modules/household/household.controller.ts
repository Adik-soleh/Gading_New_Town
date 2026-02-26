import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { HouseholdService } from './household.service';
import { CreateHouseholdDto, UpdateHouseholdDto } from './dto/household.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@Controller('api/households')
@UseGuards(AuthGuard)
export class HouseholdController {
    constructor(private householdService: HouseholdService) { }

    @Get()
    @Roles('RT')
    async findAll(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('block') block?: string,
    ) {
        return this.householdService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            search,
            block,
            user: (req as any).user,
        });
    }

    @Get(':id')
    @Roles('RT')
    async findOne(@Param('id') id: string) {
        return this.householdService.findOne(parseInt(id));
    }

    @Post()
    @Roles('RT')
    async create(@Body() dto: CreateHouseholdDto, @Req() req: Request) {
        return this.householdService.create(dto, (req as any).user?.id);
    }

    @Patch(':id')
    @Roles('RT')
    async update(@Param('id') id: string, @Body() dto: UpdateHouseholdDto, @Req() req: Request) {
        return this.householdService.update(parseInt(id), dto, (req as any).user?.id);
    }

    @Delete(':id')
    @Roles('RT')
    async remove(@Param('id') id: string, @Req() req: Request) {
        return this.householdService.remove(parseInt(id), (req as any).user?.id);
    }
}
