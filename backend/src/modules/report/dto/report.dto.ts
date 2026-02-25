import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ReportStatus } from '@prisma/client';

export class CreateReportDto {
    @IsString()
    subject: string;

    @IsString()
    description: string;

    @IsString()
    category: string;

    @IsOptional()
    @IsString()
    reporterName?: string;

    @IsOptional()
    @IsString()
    reporterBlock?: string;
}

export class UpdateReportStatusDto {
    @IsEnum(ReportStatus)
    status: ReportStatus;
}

export class RespondReportDto {
    @IsString()
    response: string;
}
