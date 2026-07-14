import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { roles } from '../common/decorators/roles.decorator.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { CustomPipe } from '../pipes/custom/custom.pipe.js';
import { FilterProductsDto } from './dto/filter-product.dto.js';
import { multerConfig } from '../config/multer.js';
import { UpdateStockDto } from './dto/update-stock.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  @Post('create')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body(CustomPipe) body: CreateProductDto,
  ) {
    const imagePath = file?.filename;

    return this.productService.create({
      ...body,
      image: imagePath,
    });
  }

  @Get('all')
  getProducts() {
    return this.productService.getProducts();
  }

   //recycle bin
  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  @Get('recycle-bin')
  productRecycleBin() {
    return this.productService.productRecycleBin();
  }

  //restore product
  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  @Patch(':id/restore')
  restoreProduct(@Param('id') id: string) {
    return this.productService.restoreProduct(id);
  }

  @Get(':id')
  productDetail(@Param('id') id: string) {
    return this.productService.productDetail(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  editProduct(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body(CustomPipe) body: UpdateProductDto,
  ) {
    return this.productService.editProduct(id, {
      ...body,
      ...(file && { image: file.filename }),
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  @Delete(':id')
  destroyProduct(@Param('id') id: string) {
    return this.productService.destroyProduct(id);
  }

  @Get()
  searchProducts(@Query() query: FilterProductsDto) {
    return this.productService.searchProducts(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  @Patch(':id/increase-stock')
  increaseStock(@Param('id') id: number, @Body() dto: UpdateStockDto) {
    return this.productService.increaseStock(id, dto.stockCount);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  @Patch(':id/decrease-stock')
  decreaseStock(@Param('id') id: number, @Body() dto: UpdateStockDto) {
    return this.productService.decreaseStock(id, dto.stockCount);
  }
}
