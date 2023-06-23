import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { AuthController as AuthControllerv1 } from './old/auth.controller';
import { AuthService as AuthServicev1 } from './old/auth.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return{
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '5m'
          }
        }
      }
    }),
    UserModule
  ],
  controllers: [AuthController, AuthControllerv1],
  providers: [AuthService, JwtStrategy, AuthServicev1],
  exports: [JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
