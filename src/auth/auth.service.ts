import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities';
import { UserService } from 'src/user/user.service';


@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }


  async login(loginUserDto: LoginUserDto) {
    
    const { email, password } = loginUserDto;
    const user = await this.userService.find({
      where: {email},
      select: {
        email: true,isActive: true, fullName: true, termsAndConditions: true, roles: true, password: true, id: true
      },
      relations: {
        company: true
      }
    });

    if (!user) throw new UnauthorizedException('Credenciales no validas');

    if(!user.isActive) throw new UnauthorizedException('Usuario inactivo, comunicate con un administrador');

    if(!user.roles.includes("super-user")){
      if(!user.company.serviceIsActive) throw new UnauthorizedException('Servicio aun no habilitado')
    }

    if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credenciales no validas');
    delete user.password;
    return {
      ...user, 
      token: this.getJwt({ id: user.id }),
      refreshToken: this.getRefreshJwt({id: user.id})
    }
  }
  
  async checkAuthStatus(user: User) {
    delete user.isActive;
    return { 
      ...user,
      token: this.getJwt({ id: user.id }),
      refreshToken: this.getRefreshJwt({ id: user.id })
    };
  }
  
  private getJwt(payload: JwtPayload) {
    
    const token = this.jwtService.sign(payload, {});

    return token;
  }

  private getRefreshJwt(payload: JwtPayload) {

    const token = this.jwtService.sign(payload, {expiresIn: "10m"});

    return token;
  }


}
