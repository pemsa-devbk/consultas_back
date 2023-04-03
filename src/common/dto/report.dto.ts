import { IsOptional, IsBoolean, IsIn, ArrayNotEmpty, IsInt } from 'class-validator';
export class ReportDTO {
    @ArrayNotEmpty()
    @IsInt({
        each: true,
        message: 'Las cuentas deben ser de tipo numerico'
    })
    accounts: number[];

    // TODO Change for enum
    @IsIn([1, 2, 3, 4], {
        message: 'Tipo de cuenta no valido'
    })
    typeAccount: number;

    @IsBoolean()
    @IsOptional()
    showGraphs?: boolean;
}