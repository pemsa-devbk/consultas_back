import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { UserAccountsService } from './user-accounts.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities';
import { AddAccountDto } from './dto/add-account.dto';
import { CreateCustomGroupDto } from '../custom-group/dto/create-cutom-group.dto';

@Controller({
  version: '1',
  path: 'accounts'
})
export class UserAccountsController {
  
  constructor(private readonly userAccountsService: UserAccountsService) {}


  @Auth()
  @Get('all')
  async getMyAccounts(
    @GetUser() user: User
  ){
    return await this.userAccountsService.getMyAccounts(user);
  }

  @Auth()
  @Get('groups')
  async getMyGroups(
    @GetUser() user: User
  ){
    return await this.userAccountsService.getMyGroupsAccounts(user);
  }

  @Auth()
  @Get('individual')
  async getMyIndividualAccounts(
    @GetUser() user: User
  ){
    return await this.userAccountsService.getMyIndividualAccounts(user)
  }

  @Auth(ValidRoles.holder, ValidRoles.admin)
  @Get('user/:id')
  async getUserAccounts(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string
  ){
    return await this.userAccountsService.getAccountsForUser(user, id);
  }


  @Auth(ValidRoles.admin, ValidRoles.holder)
  @Post('handle/:id')
  async addAccounts(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: User,
    @Body() addAccountDto: AddAccountDto
  ) {
    // if(addAccountDto.accounts.length === 0) throw new BadRequestException('Debe ingresar al menos una cuenta')
    return await this.userAccountsService.hanldeAccounts(user, id, addAccountDto);
  }

  @Auth(ValidRoles.holder)
  @Post('create-group')
  async createCustomGroup(
    @GetUser() user: User,
    @Body() createGroupDto: CreateCustomGroupDto
  ) {
    return await this.userAccountsService.createCustomGroup(user, createGroupDto);
  }

  
}
