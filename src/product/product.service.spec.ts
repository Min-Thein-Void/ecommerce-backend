import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service.js';
import { PrismaService } from '../prisma.service.js';

describe('ProductService', 
  () => {
  let service: ProductService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: { findFirst : jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('productDetail', () => {
    it('should return a product detail when a valid id is provided', async () => {
      const mockProduct = {
        id: 1,
        name: 'Laptop',
        price: 1500,
        isDeleted: false,
        category: { id: 1, name: 'Computers' },
        images: [],
        reviews: [],
      };

      mockPrismaService.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.productDetail('1');

      expect(prismaService.product.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
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
      expect(result).toEqual(mockProduct);
    });

    it('should throw an error if id is not provided', async () => {
      await expect(service.productDetail('')).rejects.toThrow('id not found');
      expect(prismaService.product.findFirst).not.toHaveBeenCalled();
    });
  });
});
