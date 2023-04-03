// import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
// import { Auth, GetUser } from '../auth/decorators';
// import { User } from '../user/entities';
// import { ValidRoles } from '../auth/interfaces';
// import { AccountsService } from './accounts.service';
// import { AddAccountDto, CreateGroupDto, UpdateGroupDto } from './dto';

// @Controller('accounts')
// export class AccountsController {

//   constructor(private readonly accountsService: AccountsService) { }


//   @Auth()
//   @Get('my-accounts')
//   getMyAccounts(
//     @GetUser() user: User
//   ) {
//     return this.accountsService.getMyAccounts(user);
//   }

//   @Auth(ValidRoles.holder)
//   @Post('create-group')
//   async createCustomGroup(
//     @GetUser() user: User,
//     @Body() createGroupDto: CreateGroupDto
//   ) {
//     return await this.accountsService.createCustomGroup(user, createGroupDto);
//   }

//   @Auth(ValidRoles.holder)
//   @Patch('update-group/:id')
//   async editCustomgroup(
//     @GetUser() user: User,
//     @Body() updateGroupDto: UpdateGroupDto,
//     @Param('id', ParseIntPipe) id: number
//   ) {
//     return await this.accountsService.updateGroup(user, updateGroupDto, id);
//   }


//   @Auth(ValidRoles.admin, ValidRoles.holder)
//   @Post('update/:id')
//   async addAccounts(
//     @Param('id', ParseUUIDPipe) id: string,
//     @GetUser() user: User,
//     @Body() addAccountDto: AddAccountDto
//   ) {
//     return await this.accountsService.updateAccounts(id, user, addAccountDto.accounts);
//   }

//   @Auth(ValidRoles.admin, ValidRoles.holder)
//   @Get('group/:id')
//   async accountGroup(
//     @GetUser() user: User,
//     @Param('id', ParseIntPipe) id: number
//   ){
//     return await this.accountsService.getCustomGroup(user, id)
//   }

//   @Auth(ValidRoles.admin, ValidRoles.holder)
//   @Get('user/:id')
//   async userAccounts(
//     @GetUser() user: User,
//     @Param('id', ParseUUIDPipe) id: string
//   ){
//     return await this.accountsService.getAccountsOfUser(user, id)
//   }


// }
