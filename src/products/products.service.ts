import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as isUUID} from 'uuid'

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

  async findAll( paginationDto: PaginationDto) {

    const { limit = 10, offset = 0} = paginationDto
    
    return await this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
    })
    
  }

  async findOne(term: string) {
    let product: Product;

    if ( isUUID(term) ) product = await this.productRepository.findOneBy({ id: term })
    else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        }).getOne()
    }  

    if ( !product ) throw new NotFoundException(`Product with term "${term}" not found`)
    return product;

  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({
      id,
      ...updateProductDto
    })

    if ( !product ) throw new NotFoundException(`Product with id: ${id} not found`)

    try {
      await this.productRepository.save(product)
      return product;
      
    } catch (error) {
      this.handleDbExceptions(error)
    }

  }

  async remove(id: string) {
    const product = await this.findOne( id )
    console.log(product);
    await this.productRepository.delete(id)
    return 'Product deleted'
  }


  private handleDbExceptions ( error: any ) {
    if ( error.code === '23505' )
        throw new BadRequestException( error.detail )

      this.logger.error(error)
      throw new InternalServerErrorException('Unexpected error, check server logs')
  } 

}
