import { All, Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';

@Controller('api/auth')
export class AuthController {
    private handler: ReturnType<typeof toNodeHandler>;

    constructor(private authService: AuthService) {
        this.handler = toNodeHandler(this.authService.auth);
    }

    @Post('login-nik')
    async loginNik(@Body() body: { nik: string }) {
        if (!body || !body.nik) {
            throw new UnauthorizedException('NIK is required');
        }
        return this.authService.loginWithNik(body.nik);
    }

    @All('*path')
    async handleAuth(@Req() req: Request, @Res() res: Response) {
        // Better Auth handles all /api/auth/* routes
        return this.handler(req, res);
    }
}
