import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, ValidateNested } from "class-validator";
import { AccountDto } from "./account.dto";

export class AddAccountDto{

    @IsArray({
        message: "Las cuentas adjuntas son obligatorias"
    })
    // @ArrayNotEmpty({message: "Debe de proporcionar al menos una cuenta"})
    @ValidateNested({each: true})
    @Type(() => AccountDto)
    accounts: AccountDto[];
}