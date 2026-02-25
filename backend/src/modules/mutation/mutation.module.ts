import { Module } from '@nestjs/common';
import { MutationService } from './mutation.service';
import { MutationController } from './mutation.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [MutationController],
    providers: [MutationService],
    exports: [MutationService],
})
export class MutationModule { }
