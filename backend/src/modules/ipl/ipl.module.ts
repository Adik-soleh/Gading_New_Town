import { Module } from '@nestjs/common';
import { IPLService } from './ipl.service';
import { IPLController } from './ipl.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [IPLController],
    providers: [IPLService],
    exports: [IPLService],
})
export class IPLModule { }
