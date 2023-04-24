import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    TypeOrmModule.forFeature([User]), // importa el modelo TypeOrm y la aplica al Producto
    CommonModule
  ],
  exports: [TypeOrmModule]
})
export class AuthModule {}
