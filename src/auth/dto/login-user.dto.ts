import { IsEmail, IsString } from "class-validator";


export class LoginUserDto{

    @IsEmail({}, {message: "Debe especificar un correo valido"})
    email: string;

    @IsString()
    password: string;
}