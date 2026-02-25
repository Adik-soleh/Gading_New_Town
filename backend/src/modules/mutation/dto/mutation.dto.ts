import { IsString, IsOptional, IsDateString, IsInt, IsEnum } from 'class-validator';
import { MutationType } from '@prisma/client';

export class CreateMutationDto {
    @IsInt()
    residentId: number;

    @IsEnum(MutationType)
    type: MutationType;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    originAddress?: string;

    @IsOptional()
    @IsString()
    destinationAddress?: string;

    @IsOptional()
    @IsString()
    block?: string;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    @IsString()
    attachment?: string;
}
