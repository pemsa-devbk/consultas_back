import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import * as dayjs from "dayjs";
const customParseFormat  = require('dayjs/plugin/customParseFormat')

@ValidatorConstraint({name: 'IsDateFormat', async: false})
export class DateFormatRule implements ValidatorConstraintInterface{
    validate(value: any, validationArguments?: ValidationArguments): boolean {
        if(typeof value !== "string"){
            return false;
        }
        dayjs.extend(customParseFormat )
        return dayjs(value, 'YYYY-MM-DD', true).isValid()
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return `Format ${validationArguments.property} is not valid`
    }
}