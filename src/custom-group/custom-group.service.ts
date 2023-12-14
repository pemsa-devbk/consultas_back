import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, forwardRef } from '@nestjs/common';
import { CreateCustomGroupDto } from './dto/create-cutom-group.dto';
import { UpdateCutomGroupDto } from './dto/update-cutom-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomGroup } from './entities/custom-group.entity';
import {  FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { GroupAccountService } from '../group-account/group-account.service';

@Injectable()
export class CustomGroupService {

  constructor(
    @InjectRepository(CustomGroup)
    private readonly customGroupRepository: Repository<CustomGroup>,
    private readonly groupAccountService: GroupAccountService
  ) { }



  findOne(options?: FindOneOptions<CustomGroup>) {
    return this.customGroupRepository.findOne(options)
  }

  create(user: User, createGroupDto: CreateCustomGroupDto){
    const {name} = createGroupDto;
    return this.customGroupRepository.create({
      user,
      name
    })
  }

  addAccounts( idAccount: number){
    return this.groupAccountService.createForGroup( idAccount)
  }

  async find(options?: FindManyOptions<CustomGroup>) {
    return await this.customGroupRepository.find(options)
  }

  private handleError(error: any): never {
    if (error.details) throw new InternalServerErrorException(error.details);
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.response) {
      const { message, statusCode } = error.response;
      throw new HttpException(message, statusCode)
    }
    throw new InternalServerErrorException('Please check server logs');
  }

  // TODO falta por implementar
  remove(id: number) {
    return `This action removes a #${id} cutomGroup`;
  }
}
