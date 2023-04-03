import { Controller, Get, Post, Body, Param, BadRequestException, Patch, Query, ParseUUIDPipe, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, PaginationDto, UpdateUserDto } from './dto';
import { Auth, GetUser } from '../auth/decorators';
import { User } from './entities';
import { ValidRoles } from '../auth/interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Auth(ValidRoles.admin, ValidRoles.holder)
  @Post()
  async registerUser(
    @Body() createUserDto: CreateUserDto,
    @GetUser() user: User
  ) {
    if (user.roles.includes('holder')) {
      createUserDto.roles = ['user'];
    }
    if (user.roles.includes('admin') && !createUserDto.roles) {
      throw new BadRequestException('El rol es necesario');
    }
    return await this.userService.createUser(createUserDto, user);
  }


  @Auth(ValidRoles.holder, ValidRoles.admin)
  @Get('my-users')
  async findMyUsers(
    @Query() paginationDto: PaginationDto,
    @GetUser() user: User
  ) {
    return await this.userService.getUsers(user, paginationDto);
  }

  @Auth(ValidRoles.holder, ValidRoles.admin)
  @Patch('reset-password/:id')
  async resetPassword(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.userService.resetPassword(user, id)
  }

  @Auth(ValidRoles.holder, ValidRoles.admin)
  @Delete('delete/:id')
  async delete(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.userService.delete(user, id)
  }

  @Auth()
  @Patch('update/:id')
  async update(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    if (user.roles.includes('holder')) {
      updateUserDto.roles = ['user'];
    }
    if (user.roles.includes('admin') && !updateUserDto.roles) {
      throw new BadRequestException('El rol es necesario');
    }
    return await this.userService.update(user, id, updateUserDto);
  }




  @Auth(ValidRoles.user, ValidRoles.holder)
  @Get('my-holder')
  async findMyHolder(@GetUser() user: User) {
    return await this.userService.getMyHolder(user);
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return await this.userService.findUser({where: {id}});
  // }

  @Auth()
  @Get('/accept-terms')
  async acceptTerms(
    @GetUser() user: User
  ) {
    return await this.userService.updateUser(user, { termsAndConditions: true, dateAcceptTerms: new Date() })
  }

  @Auth()
  @Patch('/change-state/:id')
  async changeState(
    @GetUser() user: User,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return await this.userService.changeStateUser(user, id)
  }


}
