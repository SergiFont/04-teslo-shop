import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
    ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response, // este decorador rompe la cadena de funcionamiento interna de Node. Es decir, se salta los interceptores globales y las restricciones por defecto de nest, entre otros. Usar con precaución
    // tomo el control yo de la respuesta, y dicto como quiero que se emita
    @Param('imageName') imageName: string
    ) {
    const path = this.filesService.getFile( imageName, '../../static/products' )

    res.sendFile( path )
  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )

  uploadProductFile( 
    @UploadedFile() file: Express.Multer.File,
  ){

    if ( !file ) {
      throw new BadRequestException('Make sure that the file is an image')
    }

    const secureUrl = `${ this.configService.get('HOST_API')}/files/product/${ file.filename }`

    return {
      secureUrl
    }
  }

}
