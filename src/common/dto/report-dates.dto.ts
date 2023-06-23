import { IsBoolean, IsString } from 'class-validator';
import { IsDateFormat } from 'src/common/decorators/IsdateFormat';
import { ReportDTO } from './report.dto';

export class ReportDatesDTO extends ReportDTO {
    @IsString()
    @IsDateFormat()
    dateStart: string;

    @IsString()
    @IsDateFormat()
    dateEnd: string;
}

export class ReportDatesDTOv1 extends ReportDTO {
    @IsString()
    @IsDateFormat()
    dateStart: string;

    @IsString()
    @IsDateFormat()
    dateEnd: string;

    @IsBoolean()
    advanced: boolean;
}