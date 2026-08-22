import { IsUUID, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreatePaymentDto {
    @IsUUID()
    membershipId: string;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    amount: number;
}