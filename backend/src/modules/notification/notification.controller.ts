import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/auth.guard';
import type { Request } from 'express';

@Controller('api/notifications')
@UseGuards(AuthGuard)
export class NotificationController {
    constructor(private notificationService: NotificationService) { }

    @Get()
    async findAll(
        @Req() req: Request,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('unreadOnly') unreadOnly?: string,
    ) {
        const userId = (req as any).user?.id;
        return this.notificationService.findAll(userId, {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            unreadOnly: unreadOnly === 'true',
        });
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: Request) {
        const userId = (req as any).user?.id;
        return this.notificationService.getUnreadCount(userId);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @Req() req: Request) {
        const userId = (req as any).user?.id;
        return this.notificationService.markAsRead(parseInt(id), userId);
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: Request) {
        const userId = (req as any).user?.id;
        return this.notificationService.markAllAsRead(userId);
    }
}
