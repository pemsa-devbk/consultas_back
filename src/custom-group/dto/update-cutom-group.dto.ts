import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomGroupDto } from './create-cutom-group.dto';

export class UpdateCutomGroupDto extends PartialType(CreateCustomGroupDto) {}
