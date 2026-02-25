import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class CreatePermitDto {
    @IsOptional()
    @IsInt()
    householdId?: number;

    @IsString()
    category: string;

    @IsString()
    description: string;

    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    attachment?: string;
}

export class ApprovePermitDto {
    @IsOptional()
    @IsString()
    rtNotes?: string;
}

export class RejectPermitDto {
    @IsOptional()
    @IsString()
    rtNotes?: string;
}

export class UpdatePermitDto {
    @IsOptional() @IsString() category?: string;
    @IsOptional() @IsString() description?: string;
    @IsOptional() @IsDateString() startDate?: string;
    @IsOptional() @IsDateString() endDate?: string;
    @IsOptional() @IsString() attachment?: string;
}
