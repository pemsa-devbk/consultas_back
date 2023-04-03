import { IsEnum } from "class-validator";
import { FileType } from '../../common/dto/format.type';

export class FormatFileDto {
    @IsEnum(FileType)
    format: FileType
}