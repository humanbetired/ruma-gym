import { IsArray, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class TransactionItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateTransactionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionItemDto)
  items: TransactionItemDto[];
}