import { IsIn, IsInt } from "class-validator";

export class AccountDto{
    
    @IsInt()
    idAccount: number;

    @IsIn([1,2,3,4],{
        message: "El tipo de cuenta debe ser numerico, solo se aceptan los valores 1, 2, 3, 4"
    })
    typeAccount: number;
}