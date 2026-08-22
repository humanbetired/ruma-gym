import { IsString, IsOptional, Min, IsInt } from "class-validator";

export class CreateFacilityDto {

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;

}