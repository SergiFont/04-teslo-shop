import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { validate as isUUID} from 'uuid'
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ProductImage, Product } from './entities';
import { query } from 'express';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class ProductsService {

  constructor(

    @InjectRepository(Product) // insercion de la entidad Product
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage) // insercion de la entidad Product
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,

    private readonly commonService: CommonService

  ){}

  async create(createProductDto: CreateProductDto) {
    
    try {
      const { images  = [], ...productDetails } = createProductDto

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({ url: image }))
      }); // crea instancia del producto
      await this.productRepository.save( product ) // graba la instancia en la base de datos

      return {...product, images}
      
    } catch (error) {
      this.commonService.handleDbExceptions(error)
    }

  }

  async findAll( paginationDto: PaginationDto) {

    const { limit = 10, offset = 0} = paginationDto
    
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    })
    return products.map( product => ({
      ...product,
      images: product.images.map ( img => img.url)
    }))
  }

  async findOne(term: string) {
    let product: Product

    if ( isUUID(term) ) product = await this.productRepository.findOneBy({ id: term })
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }  

    if ( !product ) throw new NotFoundException(`Product with term "${term}" not found`)
    return product

  }

  async findOnePlain ( term: string) {
    const {images = [], ...rest} = await this.findOne(term)
    return {
      ...rest,
      images: images.map(image => image.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto

    const product = await this.productRepository.preload({ id, ...toUpdate })

    if ( !product ) throw new NotFoundException(`Product with id: ${id} not found`)

    //Create query runner. Ejecuta una serie de querys. Si una de ellas falla, revierte 
    //las anteriores para que no haya impacto en la base de datos.
    const queryRunner = this.dataSource.createQueryRunner() // creado fuera del scope TRY para poder usarlo en el catch, y hacer un rollback en caso de que algo salga mal
    await queryRunner.connect() // establece conexión con la base de datos
    await queryRunner.startTransaction() // todo lo que añadamos al query runner, se añade a las transacciones

    try {

      if ( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } } ) // delete 2 parámetros. Parámetro 1: entidad objetivo. Parámetro 2: criterio sobre el que actuar en la DB
      
        product.images = images.map( 
          image => this.productImageRepository.create({ url: image })
          )
      } else {
        // TODO
      }
      await queryRunner.manager.save( product )

      // await this.productRepository.save(product)
      await queryRunner.commitTransaction() // ejecuta en base de datos todas las operaciones descritas anteriormente
      await queryRunner.release() // libera la conexión del queryRunner

      return this.findOnePlain(id)
      
    } catch (error) {
      await queryRunner.rollbackTransaction() // en caso de haber error en alguna de las operaciones, hacer rollback para dejar la DB tal y como estaba
      await queryRunner.release()
      this.commonService.handleDbExceptions(error)
    }
  }

  async remove(id: string) {
    await this.findOne( id )
    await this.productRepository.delete(id)
    return 'Product deleted'
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product')

    try {
      return await query
        .delete()
        .where({})
        .execute()

    } catch (error) {
      this.commonService.handleDbExceptions(error)
    }
  }

}
