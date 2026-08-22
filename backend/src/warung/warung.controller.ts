import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { WarungService } from './warung.service';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('warung')
@Auth('ADMIN', 'OWNER')
export class WarungController {
  constructor(private warungService: WarungService) {}

  @Get('products')
  findActiveProducts() {
    return this.warungService.findActiveProducts();
  }

  @Get('products/admin')
  @Auth('OWNER')
  findAllProductsAdmin() {
    return this.warungService.findAllProductsAdmin();
  }

  @Post('products')
  @Auth('OWNER')
  createProduct(@Body() dto: CreateProductDto) {
    return this.warungService.createProduct(dto);
  }

  @Patch('products/:id')
  @Auth('OWNER')  
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.warungService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @Auth('OWNER')
  deleteProduct(@Param('id') id: string) {
    return this.warungService.deleteProduct(id);
  }

  @Post('transactions')
  createTransaction(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTransactionDto,
  ) {
    return this.warungService.createTransaction(user.userId, dto.items);
  }

  @Get('transactions')
  findTransactions(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    let toDate: Date | undefined;
    if (to) {
      toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
    }

    return this.warungService.findTransactions({
      from: fromDate,
      to: toDate,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get('stats/daily')
  getDailySales(@Query('days') days?: string) {
    return this.warungService.getDailySales(days ? Number(days) : 7);
  }
}