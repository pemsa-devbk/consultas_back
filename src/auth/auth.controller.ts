import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { User } from '../user/entities';
import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { LoginUserDto } from './dto';

@Controller({
  version: '1',
  path: 'auth'
})
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post()
  async login(@Body() loginUserDto: LoginUserDto){
    return await this.authService.login(loginUserDto);
  }

  @Auth()
  @Get('check-auth')
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user);
  }
}
