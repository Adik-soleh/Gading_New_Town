import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateIPLPaymentDto {
    @IsOptional()
    @IsInt()
    householdId?: number;

    @IsInt()
    month: number;

    @IsInt()
    year: number;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    proofImage?: string;
}

export class VerifyIPLDto {
    @IsOptional()
    @IsString()
    notes?: string;
}

export class RejectIPLDto {
    @IsString()
    notes: string;
}
