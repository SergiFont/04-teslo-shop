import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('products')
//@Auth() // al ponerlo antes de la definición de esta clase, hago que CUALQUIERA de estas rutas pase por las normas del `Auth()` especificadas.
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth( ValidRoles.admin )
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    // console.log(paginationDto);
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) { 
    return this.productsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth( ValidRoles.admin )
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto
    ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Auth( ValidRoles.admin )
  remove(@Param('id', ParseUUIDPipe) id: string) { 
    return this.productsService.remove(id);
    // ParseUUIDPipe valida que el parámetro recibido en la petición sea un uuid
  }
}
