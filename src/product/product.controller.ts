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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { roles } from '../common/decorators/roles.decorator.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { CustomPipe } from '../pipes/custom/custom.pipe.js';
import { GetProductsDto } from './dto/get-product.dto.js';
import { multerConfig } from '../config/multer.js';

@Controller('product')
export class ProductController {
  constructor(private productService: ProductService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @roles('ADMIN')
  @Post('create')
  @UseInterceptors(FileInterceptor('image',multerConfig))
  createProduct(
    @UploadedFile() file: Express.Multer.File,
    @Body(CustomPipe) body: CreateProductDto,
  ) {
    console.log(file);
    
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

  @roles('ADMIN')
  @Patch(':id')
  editProduct(@Param('id') id: string, @Body() productData: CreateProductDto) {
    return this.productService.editProduct(id, productData);
  }

  @roles('ADMIN')
  @Delete(':id')
  destroyProduct(@Param('id') id: string) {
    return this.productService.destroyProduct(id);
  }

  @Get()
  findAll(@Query() query: GetProductsDto) {
    return this.productService.findAll(query);
  }
}
