import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { HouseholdModule } from './modules/household/household.module';
import { ResidentModule } from './modules/resident/resident.module';
import { IPLModule } from './modules/ipl/ipl.module';
import { PermitModule } from './modules/permit/permit.module';
import { MutationModule } from './modules/mutation/mutation.module';
import { ReportModule } from './modules/report/report.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    ActivityLogModule,
    HouseholdModule,
    ResidentModule,
    IPLModule,
    PermitModule,
    MutationModule,
    ReportModule,
    DashboardModule,
    UploadModule,
    NotificationModule,
  ],
})
export class AppModule { }
