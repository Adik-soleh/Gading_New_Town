import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import type { Request } from 'express';

@Controller('api/dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('stats')
    async getStats(@Req() req: Request) {
        return this.dashboardService.getStats((req as any).user);
    }

    @Get('ipl-chart')
    async getIPLChart(@Req() req: Request, @Query('year') year?: string) {
        return this.dashboardService.getIPLChart(
            year ? parseInt(year) : new Date().getFullYear(),
            (req as any).user
        );
    }

    @Get('recent-activity')
    async getRecentActivity(@Req() req: Request, @Query('limit') limit?: string) {
        return this.dashboardService.getRecentActivity(
            limit ? parseInt(limit) : 10,
            (req as any).user
        );
    }
}
