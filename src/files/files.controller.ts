import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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

    console.log(file);

    return {
      fileName: file.originalname
    }
  }

}
