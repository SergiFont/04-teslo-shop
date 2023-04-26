import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { CommonService } from 'src/common/common.service';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
    private readonly jwtService: JwtService
  ) {}
    
  async create(createUserDto: CreateUserDto): Promise<Object> {
    try {

      const { password, ...userData } = createUserDto
      
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })

      await this.userRepository.save( user )
      // delete user.password // elimina solo la password en este entorno, no de la base de datos

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      }

    } catch (error) {
      this.commonService.handleDbExceptions(error)
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<Object> {

    const { password, email } = loginUserDto

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true}
    })

    if ( !user )
    throw new UnauthorizedException('Credentials are not valid (email)')

    if (!bcrypt.compareSync( password, user.password ) )
      throw new UnauthorizedException('Credentials are not valid (password)')

      // delete user.password

    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
    
  }

  private getJwtToken( payload: JwtPayload ): string {

    const token = this.jwtService.sign( payload )
    return token

  }
}
