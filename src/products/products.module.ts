import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductImage } from './entities';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]), // importa el modelo TypeOrm y la aplica al Producto
    CommonModule,
  ],
  exports: [ProductsService, TypeOrmModule]
})
export class ProductsModule {}
