import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../../user/entities";
import { UserService } from "src/user/user.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { readFileSync } from "fs";
import { join } from "path";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        private readonly userService: UserService,
    ) {
        super({
            secretOrKey: readFileSync(join(__dirname, '../..', 'certs', 'auth', 'public.pem')), // Ruta al archivo de clave pública generada por OpenSSL
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            algorithms: ['RS256'],
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { id } = payload;
        
        if(!id){
            throw new UnauthorizedException('Token no valido');
        }
        const user = await this.userService.find({
            where: {id},
            relations:{
                company: true
            }
        });

        if(!user) throw new UnauthorizedException('Token no valido');

        if(!user.isActive) throw new UnauthorizedException('Usuario inactivo, hable con un administrador');
        delete user.password;
        return user;
    }

}