import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenue() {
    const currentYear = new Date().getFullYear(); // 2026

    const orders = await this.prisma.order.findMany({
      where: {
        status: {
          not: 'CANCELLED',
        },
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const monthlyRevenue = Array(12).fill(0); // [0index ---> 12index]

    orders.forEach((order) => {
      const month = order.createdAt.getMonth();

      monthlyRevenue[month] += order.total;
    }); // |
    // |
    // V
    return {
      labels: [
        'January', // January ----> 150,000 MMK
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],

      data: monthlyRevenue,
    };
  }

  async getDashboardStats() {
    const [revenue, orders, customers, products , pendingOrders] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          status: {
            not: 'CANCELLED',
          },
        },
        _sum: {
          total: true,
        },
      }),

      this.prisma.order.count(),

      this.prisma.user.count({
        where: {
          role: 'USER',
        },
      }),

      this.prisma.product.count({
        where: {
          isDeleted: false,
        },
      }),

      this.prisma.order.findMany({
        where : {
            status : 'PENDING'
        }
      })
    ]);

    return {
      totalRevenue: revenue._sum.total ?? 0,
      totalOrders: orders,
      totalCustomers: customers,
      totalProducts: products,
      pendingOrders : pendingOrders
    };
  }
}
