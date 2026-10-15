import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { FilterProductsDto } from './dto/filter-product.dto.js';
import { Prisma } from '../generated/prisma/client.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto, files: Express.Multer.File[]) {
    return this.prisma.product.create({
      data: {
        ...data,

        image: files[0]?.filename,

        images: {
          create: files.map((file) => ({
            image: file.filename,
          })),
        },
      },

      include: {
        category: true,
        images: true,
      },
    });
  }

  async getProducts() {
    const products = await this.prisma.product.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    console.log(products[0]);

    return products;
  }

  async productDetail(id: string) {
    if (!id) {
      throw new Error('id not found');
    }
    return this.prisma.product.findFirst({
      where: {
        id: Number(id),
        isDeleted: false,
      },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  async editProduct(id: number, productData: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: productData,
    });
  }

  async destroyProduct(id: string) {
    return this.prisma.product.update({
      where: {
        id: Number(id),
      },
      data: {
        isDeleted: true,
      },
    });
  }

  // Mental Model
  // findMany({
  //   where      // ဘယ် data တွေယူမလဲ
  //   skip       // ဘယ်နှခုကျော်မလဲ
  //   take       // ဘယ်နှခုယူမလဲ
  //   include    // relation တွေပါယူမလား
  //   orderBy    // ဘယ်လိုစီမလဲ
  // })

  // Flow Diagram
  // User
  // ?page=3
  //     │
  //     ▼
  // page = 3

  // limit = 12
  //     │
  //     ▼
  // skip = (3-1)*12
  //     │
  //     ▼
  // skip = 24
  //     │
  //     ▼
  // Prisma
  // Skip first 24 rows
  // Take next 12 rows

  async searchProducts(query: FilterProductsDto) {
    const { search, categoryId, price, minStock, page = 1, limit = 8 } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // price range
    if (price) {
      where.price = price;
    }

    // stock filter
    if (minStock) {
      where.stock = {
        gte: minStock,
      };
    }

    // Database query ၂ ခုရဲ့ result ကို array destructuring နဲ့ ခွဲယူမယ်
    // ပထမ result ကို products variable ထဲထည့်မယ်
    // ဒုတိယ result ကို total variable ထဲထည့်မယ်
    const [products, total] = await this.prisma.$transaction([
      // ပထမ database query
      // လက်ရှိ filter နဲ့ ကိုက်တဲ့ product တွေကို ရှာမယ်
      this.prisma.product.findMany({
        // ဘယ် products တွေယူမလဲဆိုတဲ့ filter condition
        // search, category, stock, deleted status စတာတွေပါဝင်မယ်
        where,

        // pagination အတွက်
        // အစမှာ ဘယ်နှခုကျော်ပြီးမှ data ယူမလဲ
        // ဥပမာ page 3 ဆိုရင် ပထမ 24 ခု skip လုပ်မယ်
        skip,

        // pagination အတွက်
        // skip ပြီးရင် ဘယ်နှခုယူမလဲ
        // default limit = 12 ဆိုရင် product 12 ခုယူမယ်
        take: limit,

        // Product နဲ့ဆက်နွယ်တဲ့ relation data တွေပါယူမယ်
        // ဒီနေရာမှာ category information ပါယူမယ်
        include: {
          category: true,
          images: true,
        },

        // Product တွေကို ဘယ်လို order စီမလဲ
        // createdAt အသစ်ဆုံးကနေ အဟောင်းဆုံးအထိ ပြမယ်
        orderBy: {
          createdAt: 'desc',
        },
      }),

      // ဒုတိယ database query
      // Filter နဲ့ကိုက်တဲ့ product အရေအတွက်စုစုပေါင်းကိုတွက်မယ်
      this.prisma.product.count({
        // findMany မှာသုံးထားတဲ့ filter နဲ့တူတူသုံးမယ်
        // ဒါမှ total number မှန်ကန်မယ်
        where,
      }),
    ]);

    // စုစုပေါင်း product အရေအတွက်နဲ့ limit ကိုသုံးပြီး
    // page ဘယ်နှခုရှိမလဲတွက်မယ်
    const totalPages = Math.ceil(total / limit);

    // Frontend ကို response ပြန်ပေးမယ်
    return {
      // လက်ရှိ page မှာရှိတဲ့ product list
      // ဥပမာ page 1 ဆို product 12 ခု
      data: products,

      // Pagination information တွေ
      // frontend က button တွေတည်ဆောက်ဖို့သုံးမယ်
      meta: {
        // လက်ရှိရောက်နေတဲ့ page number
        // ဥပမာ page 2
        page,

        // တစ် page မှာပြမယ့် product အရေအတွက်
        // ဥပမာ 12 products
        limit,

        // Database ထဲမှာ filter နဲ့ကိုက်တဲ့ product စုစုပေါင်း
        // ဥပမာ 50 products
        total,

        // Page စုစုပေါင်း
        // ဥပမာ 50 / 12 = 4.16
        // Math.ceil လုပ်လို့ 5 pages
        totalPages,
      },
    };
  }

  async increaseStock(productId: number, stockCount: number) {
    return await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          increment: stockCount,
        },
      },
      include: {
        category: true,
      },
    });
  }

  async decreaseStock(productId: number, stockCount: number) {
    return await this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          decrement: stockCount,
        },
      },
      include: {
        category: true,
      },
    });
  }

  async productRecycleBin() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: true,
      },
      include: {
        category: true,
        reviews: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  async restoreProduct(productId: string) {
    return await this.prisma.product.update({
      where: {
        id: Number(productId),
      },
      data: {
        isDeleted: false,
      },
    });
  }
}
