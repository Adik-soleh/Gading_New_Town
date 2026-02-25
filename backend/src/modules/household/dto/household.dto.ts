import { IsString, IsOptional, IsEnum } from 'class-validator';
import { OwnershipType } from '@prisma/client';

export class CreateHouseholdDto {
    @IsString()
    kkNumber: string;

    @IsString()
    address: string;

    @IsString()
    block: string;

    @IsString()
    houseNumber: string;

    @IsOptional()
    @IsEnum(OwnershipType)
    ownershipType?: OwnershipType;

    @IsOptional()
    headOfFamilyId?: number;
}

export class UpdateHouseholdDto {
    @IsOptional()
    @IsString()
    kkNumber?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    block?: string;

    @IsOptional()
    @IsString()
    houseNumber?: string;

    @IsOptional()
    @IsEnum(OwnershipType)
    ownershipType?: OwnershipType;

    @IsOptional()
    headOfFamilyId?: number;
}
