import { Module } from '@nestjs/common';
import { ResidentService } from './resident.service';
import { ResidentController } from './resident.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [ResidentController],
    providers: [ResidentService],
    exports: [ResidentService],
})
export class ResidentModule { }
