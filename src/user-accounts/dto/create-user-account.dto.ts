import { IsInt } from "class-validator";


export class CreateUserAccountDto{
    @IsInt()
    idAccount: number;

    @IsInt()
    typeAccount: number;
}