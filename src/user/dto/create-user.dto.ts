import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString({
        message: 'El nombre debe ser de tipo texto'
    })
    @MinLength(5, {
        message: 'El nombre debe de tener al menos 10 caracteres'
    })
    fullName: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsIn(["super-user","admin", "holder", "user"],{
        message: 'El campo roles debe ser de tipo arreglo',
        each: true
    })
    roles: string[];

}
