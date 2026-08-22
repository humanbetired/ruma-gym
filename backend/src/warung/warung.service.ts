import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class WarungService {
  constructor(private prisma: PrismaService) {}

  //  PRODUCTS

  async createProduct(data: { name: string; price: number; stock: number }) {
    return this.prisma.warungProduct.create({ data });
  }

  async findAllProductsAdmin() {
    return this.prisma.warungProduct.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findActiveProducts() {
    return this.prisma.warungProduct.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      orderBy: { name: 'asc' },
    });
  }

  async updateProduct(
    id: string,
    data: { name?: string; price?: number; stock?: number; isActive?: boolean },
  ) {
    const product = await this.prisma.warungProduct.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return this.prisma.warungProduct.update({ where: { id }, data });
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.warungProduct.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return this.prisma.warungProduct.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // TRANSACTIONS

  async createTransaction(
    recordedBy: string,
    items: { productId: string; quantity: number }[],
  ) {
    if (items.length === 0) {
      throw new BadRequestException('Transaksi harus memiliki minimal satu barang');
    }

    const productIds = items.map((i) => i.productId);
    const products = await this.prisma.warungProduct.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Produk dengan id ${item.productId} tidak ditemukan`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Stok ${product.name} tidak mencukupi (tersisa ${product.stock})`);
      }
    }

    const totalAmount = items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.warungTransaction.create({
        data: { recordedBy, totalAmount },
      });

      for (const item of items) {
        const product = productMap.get(item.productId)!;

        await tx.warungTransactionItem.create({
          data: {
            transactionId: transaction.id,
            productId: product.id,
            productName: product.name,
            priceAtSale: product.price,
            quantity: item.quantity,
          },
        });

        await tx.warungProduct.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.warungTransaction.findUnique({
        where: { id: transaction.id },
        include: { items: true },
      });
    });
  }

  async findTransactions(params: {
    from?: Date;
    to?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { from, to, search, page = 1, limit = 10 } = params;

    const where: Prisma.WarungTransactionWhereInput = {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            items: {
              some: {
                productName: { contains: search },
              },
            },
          }
        : {}),
    };

    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.warungTransaction.findMany({
        where,
        include: {
          items: true,
          recordedByUser: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.warungTransaction.count({ where }),
    ]);

    return {
      data: transactions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDailySales(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await this.prisma.warungTransaction.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, totalAmount: true },
    });

    const grouped: Record<string, number> = {};

    for (const trx of transactions) {
      const dateKey = trx.createdAt.toISOString().split('T')[0];
      grouped[dateKey] = (grouped[dateKey] || 0) + Number(trx.totalAmount);
    }

    return Object.entries(grouped)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}