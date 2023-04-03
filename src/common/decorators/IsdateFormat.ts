import { registerDecorator, ValidationOptions } from "class-validator";
import { DateFormatRule } from "../validators/IsDateRule";

export function IsDateFormat(validationOptions?: ValidationOptions){
    return function(object: any, propertyName: string){
        registerDecorator({
            name: 'IsFormatDate',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: DateFormatRule
        });
    };
}