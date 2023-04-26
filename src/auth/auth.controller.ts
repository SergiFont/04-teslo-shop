import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto'; // exportando desde un archivo index, es este el que se lee automáticamente al hacer
import { AuthGuard } from '@nestjs/passport';
// importaciones a un directorio sin especificar el archivo


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login( loginUserDto );
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute() {
    return {
      ok: true,
      message: 'hello there'
    }
  }
}
