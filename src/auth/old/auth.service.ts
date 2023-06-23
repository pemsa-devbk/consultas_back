import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from '../dto';
import { User } from 'src/user/entities';
import { JwtPayload } from '../interfaces';


@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }


    async login(loginUserDto: LoginUserDto) {

        const { email, password } = loginUserDto;
        const user = await this.userService.find({
            where: { email },
            select: {
                email: true, fullName: true, password: true, id: true, isActive: true
            }
        });

        
        
        if (!user) throw new UnauthorizedException('Credenciales no validas');

        if (!user.isActive) throw new UnauthorizedException('Usuario inactivo, comunicate con un administrador')

        if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credenciales no validas');
        delete user.password;
        return {
            status: true,
            data:{
                uid: user.id,
                name: user.fullName,
                email: user.email,
                token: this.getJwt({ id: user.id }),
            }
        }
    }

    async checkAuthStatus(user: User) {
        delete user.isActive;
        return {
            status: true,
            data:{
                uid: user.id,
                name: user.fullName,
                email: user.email,
                token: this.getJwt({ id: user.id })
            }
        };
    }

    private getJwt(payload: JwtPayload) {

        const token = this.jwtService.sign(payload, {});

        return token;
    }


}
