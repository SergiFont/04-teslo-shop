import { join } from 'path';
import { existsSync } from 'fs';
import { CommonService } from '../common/common.service'

import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {

    constructor(
        private readonly commonService: CommonService
    ){}
  
    getStaticProductImage( imageName: string ) {

        const path = join( __dirname, '../../static/products', imageName )

        if ( !existsSync(path) ) throw new BadRequestException(`No product: ${ imageName } was found`)

        return path
    }

    getFile( file: string, directory: string ) {
        return this.commonService.getStaticFile( file, directory )
    }

}
