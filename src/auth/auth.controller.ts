import { IncomingHttpHeaders } from 'http';
import { Controller, Post, Body, Get, UseGuards, Req, Header, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto'; // exportando desde un archivo index, es este el que se lee automáticamente al hacer importaciones a un directorio sin especificar el archivo
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { Auth } from './decorators';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto): Promise<Object> {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto): Promise<Object> {
    return this.authService.login( loginUserDto );
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User): Promise<Object> {
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute(
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,
  ) {



    return {
      ok: true,
      message: 'hello there',
      user,
      rawHeaders,
      headers
    }
  }
  /*
  *@SetMetadata('roles', ['admin', 'super-user'])
  this form of getting data from the execution context is dangerous. Hard tipping roles is subject to many human errors, and therefore errors, on the security
  */

  @Get('private2')
  @RoleProtected( ValidRoles.superUser, ValidRoles.admin )
  @UseGuards( AuthGuard(), UserRoleGuard )
  privateRoute2(
    @GetUser() user: User
  ) {
    return {
      ok: true, 
      user
    }
  }

  @Get('private3')
  @Auth( ValidRoles.admin)
  privateRoute3(
    @GetUser() user: User
  ) {
    return {
      ok: true, 
      user
    }
  }

}
