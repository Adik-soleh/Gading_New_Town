import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        // Convert Express headers to Web Headers for Better Auth
        const headers = new Headers();
        for (const [key, value] of Object.entries(request.headers)) {
            if (value) {
                headers.set(key, Array.isArray(value) ? value.join(', ') : value);
            }
        }

        const session = await this.authService.getSession(headers);

        if (!session || !session.user) {
            throw new UnauthorizedException('Not authenticated');
        }

        // Attach user to request for downstream use
        (request as any).user = session.user;
        (request as any).session = session.session;

        // Check role-based access
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (requiredRoles && requiredRoles.length > 0) {
            const userRole = (session.user as any).role;
            if (!requiredRoles.includes(userRole)) {
                throw new UnauthorizedException('Insufficient permissions');
            }
        }

        return true;
    }
}
