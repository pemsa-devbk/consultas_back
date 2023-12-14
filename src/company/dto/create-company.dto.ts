import { IsDefined, IsInt, IsString, MaxLength, ValidateNested } from "class-validator";
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { Type } from "class-transformer";

export class CreateCompanyDto {

    @IsString()
    name: string;


    @IsString()
    @MaxLength(6)
    shortName: string;

    // @IsUrl({
    //     require_tld: false
    // })
    @IsString()
    serviceUrl: string;

    @IsInt()
    portService: number;

    @IsDefined()
    @ValidateNested()
    @Type(() => CreateUserDto)
    user: CreateUserDto;

}
