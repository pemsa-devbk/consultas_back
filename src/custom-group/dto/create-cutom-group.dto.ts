import { ArrayNotEmpty, IsInt, IsString } from "class-validator";

export class CreateCustomGroupDto {
    @IsString()
    name: string;

    @IsInt({
        message: "Las cuentas adjuntas son obligatorias",
        each: true
    })
    @ArrayNotEmpty({ message: "Debe de proporcionar al menos una cuenta" })
    accounts: number[];
}
