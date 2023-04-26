import { existsSync } from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class CommonService {

    private readonly logger = new Logger('ProductsService')

    getStaticFile( file: string, directory: string ) {

        const path = join( __dirname, directory, file )

        if ( !existsSync(path) ) throw new BadRequestException(`No product: ${ file } was found`)

        return path
    }

    handleDbExceptions ( error: any ): never {
        
        if ( error.code === '23505' )
            throw new BadRequestException( error.detail )
    
          this.logger.error(error)
          throw new InternalServerErrorException('Unexpected error, check server logs')
      } // TODO crear un Modulo para este tipo de manejo de errores
}
