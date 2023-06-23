import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { Auth, GetUser } from '../../auth/decorators';
import { User } from '../../user/entities';
import { ValidRoles } from 'src/auth/interfaces';
import { AccountsService } from './accounts.service';

@Controller({
  version: '1',
  path: 'accounts'
})
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
  ) {
    return await this.accSr.getAccountsForUser(user, id);
  }









}
