import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsUUID } from 'class-validator';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(

    @InjectRepository(Product) // insercion de la entidad Product
    private readonly productRepository: Repository<Product>,

  ){}

  async create(createProductDto: CreateProductDto) {
    
    try {

      const product = this.productRepository.create(createProductDto); // crea instancia del producto
      await this.productRepository.save( product ) // graba la instancia en la base de datos

      return product;
      
    } catch (error) {
      this.handleDbExceptions(error)
    }

  }

  async findAll() {
    
    const products = await this.productRepository.find()
    return products
  }

  async findOne(id: string) {

    const product: Product = await this.productRepository.findOneBy({ id })
    if ( !product ) throw new NotFoundException(`Pokemon with id "${id}" not found`)
    return product;

  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne( id )
    console.log(product);
    await this.productRepository.delete(id)
    return 'Product deleted'
  }


  private handleDbExceptions ( error: any ) {
    if ( error.code === '23505' )
        throw new InternalServerErrorException( error.detail )

      this.logger.error(error)
      throw new InternalServerErrorException('Unexpected error, check server logs')
  } 

}
