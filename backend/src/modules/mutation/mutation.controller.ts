import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { MutationService } from './mutation.service';
import { CreateMutationDto } from './dto/mutation.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@Controller('api/mutations')
@UseGuards(AuthGuard)
export class MutationController {
    constructor(private mutationService: MutationService) { }

    @Get()
    async findAll(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
    ) {
        return this.mutationService.findAll({
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            type,
            status,
            user: (req as any).user,
        });
    }

    @Get('stats')
    async getStats(@Req() req: Request) {
        return this.mutationService.getStats((req as any).user);
    }

    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req: Request) {
        return this.mutationService.findOne(parseInt(id), (req as any).user);
    }

    @Post()
    async create(@Body() dto: CreateMutationDto, @Req() req: Request) {
        return this.mutationService.create(dto, (req as any).user?.id);
    }

    @Patch(':id/verify')
    @Roles('RT')
    async verify(@Param('id') id: string, @Req() req: Request) {
        return this.mutationService.verify(parseInt(id), (req as any).user?.id);
    }
}
