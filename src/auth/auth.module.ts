import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { CommonModule } from 'src/common/common.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User]), // importa el modelo TypeOrm y la aplica al Producto
    CommonModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,

    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: ( configService: ConfigService ) => { // inyección de dependencia como si fuera en el constructor de una clase
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '2h'
          }
        }
      }    
    })
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
