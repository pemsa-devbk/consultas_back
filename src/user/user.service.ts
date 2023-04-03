import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities';
import { DeepPartial, FindOneOptions, FindOptionsWhere, Like, Not, Raw, Repository } from 'typeorm';
import { CreateUserDto, PaginationDto, UpdateUserDto } from './dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { MailerService } from '../mailer/mailer.service';
import { isUUID } from 'class-validator';
@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService
  ) { }


  async createUser(createUserDto: CreateUserDto, user: User) {
    const password = this.generatePassword(10);
    try {
      const newUser = this.userRepository.create({
        ...createUserDto,
        createdBy: user,
        password: bcrypt.hashSync(password, 10)
      });
      
      await this.userRepository.save(newUser);
      await this.mailerService.sendWelcome(createUserDto.fullName, createUserDto.email, password);

      delete newUser.password;

      return newUser;

    } catch (error) {
      this.handleDBError(error);
    }
  }

  async getUsers(user: User, paginationDto: PaginationDto) {

    const { limit = 5, page = 1, term = '' } = paginationDto;

    try {
      let whereCondition: FindOptionsWhere<User> | FindOptionsWhere<User>[];

      if (user.roles.includes(ValidRoles.admin)) {
        whereCondition = {
          id: Not(user.id),
        }
      } else {
        whereCondition = {
          createdBy: {
            id: user.id
          }
        };
      }
      const [users, total] = await this.userRepository.findAndCount({
        where: [
          {
            ...whereCondition,
            fullName: Raw(alias => `LOWER(${alias}) Like('%${term.toLowerCase()}%')`)
          },
          {
            ...whereCondition,
            email: Raw(alias => `LOWER(${alias}) Like('%${term.toLowerCase()}%')`)
          }
        ],
        order: {
          fullName: 'ASC'
        },
        take: limit,
        skip: (page - 1) * limit,
        relations: { createdBy: true },
      });

      return {
        users,
        total,
        loadMore: (page * limit) < total
      };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async find(options: FindOneOptions<User>) {
    return this.userRepository.findOne(options);
  }

  async delete(user: User, id: string) {
    try {
      const userToDelete = await this.find({
        where: {
          id
        },
        relations: {
          createdBy: true
        }
      });
      if (!user.roles.includes(ValidRoles.admin)) {
        if (user.id !== userToDelete.createdBy.id) throw new UnauthorizedException('Acción no valida')
      }
      if (!userToDelete) throw new NotFoundException('Usuario no existente')
      await this.userRepository.remove(userToDelete);
      return {
        status: true
      };
    } catch (error) {
      this.handleDBError(error)
    }
  }

  async resetPassword(user: User, id: string) {
    try {
      const userToUpdate = await this.find({
        where: {
          id
        },
        relations: {
          createdBy: true
        }
      });
      if (!user.roles.includes(ValidRoles.admin)) {
        if (user.id !== userToUpdate.createdBy.id) throw new UnauthorizedException('Acción no valida')
      }
      const password = this.generatePassword(10);
      userToUpdate.password = bcrypt.hashSync(password, 10);

      await this.userRepository.save(userToUpdate);
      await this.mailerService.sendResetPw(userToUpdate.fullName, userToUpdate.email, password, userToUpdate.createdBy.fullName)
      delete userToUpdate.password;
      delete userToUpdate.createdBy;

      return {
        status: true
      };
    } catch (error) {
      this.handleDBError(error)
    }
  }

  async update(user: User, id: string, updateUserDto: UpdateUserDto) {
    try {

      const userToUpdate = await this.find({
        where: {
          id
        },
        select: {
          id: true,
          password: true,
          roles: true,
          fullName: true,
          email: true,
          isActive: true,
          termsAndConditions: true,
          createdBy: {
            id: true,
            roles: true,
            fullName: true,
            email: true,
            isActive: true,
            termsAndConditions: true,
          },
        },
        relations: {
          createdBy: true
        }
      })
      let password: string;
      if (!userToUpdate) throw new NotFoundException('Usuario no existente');

      // if(user.roles.includes(ValidRoles.holder) && user.id === id) throw new 
      if (user.id !== id) { // * Lo va  actualizar su holder
        if (!user.roles.includes(ValidRoles.admin) && user.id !== userToUpdate.createdBy.id) throw new UnauthorizedException('Acción no valida')
      }

      if (updateUserDto.password && updateUserDto.lastPassword) {
        if (!bcrypt.compareSync(updateUserDto.lastPassword, userToUpdate.password)) throw new UnauthorizedException('Las contraseña no coincide');
        password = bcrypt.hashSync(updateUserDto.password, 10);
      }

      const userUpdate = await this.userRepository.preload({
        id,
        ...updateUserDto,
        password: password ? password : userToUpdate.password
      });
      await this.userRepository.save(userUpdate);
      delete userToUpdate.password;

      return userToUpdate;

    } catch (error) {
      this.handleDBError(error)
    }
  }

  async verifyHolder(idUser: string, idHolder: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: idUser,
        createdBy: {
          id: idHolder
        }
      }
    });

  }// TODO verificar uso

  // TODO Para filtrar por rol
  // const users = await this.userRepository.createQueryBuilder('users')
  //   .where('users.roles @> :roles', { roles: ['holder'] })
  //   .getMany()

  async getMyHolder(user: User) {
    try {
      const users = await this.userRepository.findOne({
        where: { id: user.id },
        relations: {
          createdBy: true
        }
      });
      if (!users) {
        throw new NotFoundException('No se encontro el dealer')
      }
      return users.createdBy;
    } catch (error) {
      this.handleDBError(error);
    }
  } // * OK



  async updateUser(user: User, toUpdate: DeepPartial<User>) {
    try {
      const updatedUser = await this.userRepository.preload({
        id: user.id,
        ...toUpdate
      })
      await this.userRepository.save(updatedUser);
      return updatedUser;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async changeStateUser(user: User, id: string) {
    try {
      const userFind = await this.userRepository.findOne({
        where: { id },
        relations: {
          createdBy: true
        }
      });
      if (!userFind) throw new NotFoundException('Usuario no encontrado');

      if (!user.roles.includes(ValidRoles.admin)) {
        if (user.id !== userFind.createdBy.id) throw new UnauthorizedException('Operación no valida')
      }
      userFind.isActive = !userFind.isActive;
      await this.userRepository.save(userFind);
      return {
        message: userFind.isActive ? `${userFind.fullName} habilitado` : `${userFind.fullName} deshabilitado`
      }
    } catch (error) {
      this.handleDBError(error);
    }
  }


  private generatePassword(characters: number) {
    const lower = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    const upper = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const specialCharacters = ['!', '*', '(', ')', '#', '$', '%', '&', '=', '?', '¿'];
    let password = '';
    let index = 0;
    for (let i = 0; i <= characters; i++) {
      const group = Math.floor(Math.random() * 5);
      switch (group) {
        case 1:
          index = Math.floor(Math.random() * (lower.length - 1));
          password = password + lower[index];
          break;
        case 2:
          index = Math.floor(Math.random() * (upper.length - 1));
          password = password + upper[index];
          break;
        case 3:
          index = Math.floor(Math.random() * (numbers.length - 1));
          password = password + numbers[index];
          break;
        case 4:
          index = Math.floor(Math.random() * (specialCharacters.length - 1));
          password = password + specialCharacters[index];
          break;
      }
    }
    return password;
  }
  private handleDBError(error: any): never {
    console.log(error);

    if (error.response) {
      const { message, statusCode } = error.response;
      throw new HttpException(message, statusCode)
    }
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    throw new InternalServerErrorException('Please check server logs');
  }

}
