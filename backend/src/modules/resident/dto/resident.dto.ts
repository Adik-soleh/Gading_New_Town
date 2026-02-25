import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { FamilyRole, ResidentStatus } from '@prisma/client';

export class CreateResidentDto {
    @IsString()
    nik: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(FamilyRole)
    familyRole?: FamilyRole;

    @IsOptional()
    @IsEnum(ResidentStatus)
    status?: ResidentStatus;

    @IsInt()
    householdId: number;
}

export class UpdateResidentDto {
    @IsOptional()
    @IsString()
    nik?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEnum(FamilyRole)
    familyRole?: FamilyRole;

    @IsOptional()
    @IsEnum(ResidentStatus)
    status?: ResidentStatus;

    @IsOptional()
    @IsInt()
    householdId?: number;
}
