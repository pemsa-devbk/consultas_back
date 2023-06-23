import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '../user/entities';
import { ValidRoles } from 'src/auth/interfaces';
import { AddAccountDto, CreateGroupDto, UpdateGroupDto } from './dto';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {

  constructor(
    private readonly accSr: AccountsService
  ) { }

  @Auth()
  @Get('my-accounts')
  async getMyAccounts(
    @GetUser() user: User
  ) {
    return await this.accSr.getMyAccounts(user);
  }

  @Auth()
  @Get('my-groups')
  async getMyGroups(
    @GetUser() user: User
  ) {
    console.log('aqui');
    
    return await this.accSr.getMyGroupsAccounts(user);
  }

  @Auth()
  @Get('my-individual-accounts')
  async getMyIndividualAccounts(
    @GetUser() user: User
  ) {
    return await this.accSr.getMyIndividualAccounts(user);
  }

  @Auth(ValidRoles.holder, ValidRoles.admin)
  @Get('user/:id')
  async getUserAccounts(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string
  ){
    return await this.accSr.getAccountsForUser(user, id);
  }

  @Auth(ValidRoles.holder)
  @Post('create-group')
  async createCustomGroup(
    @GetUser() user: User,
    @Body() createGroupDto: CreateGroupDto
  ) {
    return await this.accSr.createCustomGroup(user, createGroupDto);
  }

  @Auth(ValidRoles.holder, ValidRoles.admin)
  @Patch('update-group/:id')
  async editCustomgroup(
    @GetUser() user: User,
    @Body() updateGroupDto: UpdateGroupDto,
    @Param('id', ParseIntPipe) id: number
  ) {
    return await this.accSr.updateGroup(user, updateGroupDto, id);
  }


  @Auth(ValidRoles.admin, ValidRoles.holder)
  @Post('handle/:id')
  async addAccounts(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Body() addAccountDto: AddAccountDto
  ) {
    // if(addAccountDto.accounts.length === 0) throw new BadRequestException('Debe ingresar al menos una cuenta')
    return await this.accSr.hanldeAccounts( user, id, addAccountDto);
  }



  @Auth(ValidRoles.admin, ValidRoles.holder)
  @Get('group/:id')
  async accountGroup(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number
  ){
    return await this.accSr.getCustomGroup(user, id)
  }

  


}
