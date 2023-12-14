import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAccounts } from './entities/user-accounts.entity';
import { DataSource, In, Repository } from 'typeorm';
import { DbServiceClient } from '../common/interfaces/db/DbService';
import { User } from '../user/entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { firstValueFrom, forkJoin } from 'rxjs';
import { GroupRequest } from '../common/interfaces/groups/GroupRequest';
import { CustomGroupService } from '../custom-group/custom-group.service';
import { UserService } from '../user/user.service';
import { AddAccountDto } from './dto/add-account.dto';
import { AccountDto } from './dto/account.dto';
import { CreateCustomGroupDto } from '../custom-group/dto/create-cutom-group.dto';
import { ServicesService } from '../services/services.service';

@Injectable()
export class UserAccountsService  {



  constructor(
    @InjectRepository(UserAccounts)
    private readonly userAccountsRepository: Repository<UserAccounts>,
    private readonly customGroupService: CustomGroupService,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly servicesServices: ServicesService
  ) { }

  
  async getMyAccounts(user: User) {

    const service = this.servicesServices.getService(user.company.id);

    try {
      // * Obtener todas las cuentas si se trata de un administrador
      if (user.roles.includes(ValidRoles.admin)) {
        const queries = forkJoin([
          service.searchAccounts({ state: "Activas" }),
          service.searchGroups({})
        ]);

        const [accounts, groups] = await firstValueFrom(queries);

        return {
          accounts: accounts.accounts,
          groups: groups.groups
        }
      }

      const { accounts, groups } = await this.getAccountsInformation(user, service, true);

      return {
        accounts,
        groups,
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMyGroupsAccounts(user: User) {
    const service = this.servicesServices.getService(user.company.id);
    try {
      // * Si el usuario es administrador
      if (user.roles.includes('admin')) {
        const groups = await this.getGroups([], service, false);
        return {
          groups: groups.groups
        }
      }

      const userAccounts = await this.myAccounts(user.id);
      const { groupAccounts, customGroupsAccounts } = this.separateAccounts(userAccounts);

      // * Obtiene los grupos y los devuelve formateados
      return await this.getGroupsFormat(groupAccounts, customGroupsAccounts, service);

    } catch (error) {
      this.handleError(error);
    }

  }

  async getMyIndividualAccounts(user: User) {

    const service = this.servicesServices.getService(user.company.id);

    try {
      if (user.roles.includes('admin')) { // * Admin Mostrar todas las cuentas
        const accounts = await this.getAccounts([], service);
        return {
          accounts: accounts.accounts
        }
      }

      const { accounts } = await this.getAccountsInformation(user, service);

      return {
        accounts,
      }

    } catch (error) {
      this.handleError(error);
    }
  }

  async getAccountsForUser(user: User, id: string) {
    const service = this.servicesServices.getService(user.company.id);
    try {
      const userGet = await this.userService.find({ where: { id }, relations: { createdBy: true } });
      if (!userGet) throw new NotFoundException('Usuario no existente');
      if (!user.roles.includes('admin')) {
        if (userGet.createdBy.id !== user.id) throw new BadRequestException('Operación no valida');
      }
      const userAccounts = await this.myAccounts(id);

      const { groupAccounts, customGroupsAccounts, individualAccounts } = this.separateAccounts(userAccounts);

      const [accounts, groups] = await Promise.all([
        (individualAccounts.length === 0) ? { accounts: [] } : this.getAccounts(individualAccounts, service),
        (groupAccounts.length === 0 && customGroupsAccounts.length === 0) ? { groups: [] } : this.getGroupsFormat(groupAccounts, customGroupsAccounts, service)
      ]);
      delete userGet.createdBy;
      return {
        user: userGet,
        accounts: accounts.accounts,
        groups: groups.groups
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async hanldeAccounts(user: User, id: string, addAccountDto: AddAccountDto) {
    const { accounts } = addAccountDto;
    try {
      const userToAdd = await this.userService.find({ where: { id }, relations: { accounts: true, createdBy: true } });
      if (!userToAdd) throw new NotFoundException('Usuario no existente');


      const accountToDelete = userToAdd.accounts.filter(account => !accounts.find(acc => acc.typeAccount === account.typeAccount && acc.idAccount === account.idAccount)).map(acc => acc.id);
      const accountsToAdd: AccountDto[] = accounts.filter(account => !userToAdd.accounts.find(acc => acc.typeAccount === account.typeAccount && acc.idAccount === account.idAccount));


      if (user.roles.includes('admin')) {
        await this.updateMyAccounts(accountToDelete, accountsToAdd, userToAdd);
        return await this.getAccountsForUser(user, id)
      }
      if (userToAdd.createdBy.id !== user.id) throw new BadRequestException('Operación no valida');

      if (accountToDelete.length === 0 && accountsToAdd.length === 0) return await this.getAccountsForUser(user, id)


      const accountsHolder = await this.myAccounts(user.id);
      const { groupAccounts: groupsHolder, customGroupsAccounts: customGrHolder } = this.separateAccounts(accountsHolder);

      const individualAdd = accountsToAdd.filter(acc => acc.typeAccount === 1).map(acc => acc.idAccount);
      await this.validIndividualAccounts(individualAdd, user);
      const groupAdd = accountsToAdd.filter(acc => (acc.typeAccount === 2 || acc.typeAccount === 3));
      this.validGroups(groupAdd, groupsHolder);
      const customGroupAdd = accounts.filter(acc => acc.typeAccount === 4);
      const isCorrectCs = customGroupAdd.every(acc => customGrHolder.find(ach => ach === acc.idAccount));
      if (!isCorrectCs) throw new BadRequestException('Alguna de las cuentas no pertenecen al dealer');

      await this.updateMyAccounts(accountToDelete, accountsToAdd, userToAdd);

      return await this.getAccountsForUser(user, id)

    } catch (error) {
      this.handleError(error);
    }
  }

  // ! refactorizar
  async createCustomGroup(user: User, createGroupDto: CreateCustomGroupDto) {

    const { accounts } = await this.getMyIndividualAccounts(user);

    const isCoorect = createGroupDto.accounts.every(acc => accounts.find(ach => ach.CodigoCte === acc.toString()));

    if (!isCoorect) throw new BadRequestException('Algunas cuentas no estan asignadas');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newGroup = this.customGroupService.create(user, createGroupDto);
      const accountToGroup = createGroupDto.accounts.map(account => this.customGroupService.addAccounts(account));

      await queryRunner.manager.save(accountToGroup);

      newGroup.accounts = accountToGroup; 
      
      await queryRunner.manager.save(newGroup);

      const assigGroup = this.userAccountsRepository.create({
        user,
        idAccount: newGroup.idGroup,
        typeAccount: 4
      });

      await queryRunner.manager.save(assigGroup);


      await queryRunner.commitTransaction();

      return {
        data: {
          idGroup: newGroup.idGroup,
          name: newGroup.name
        }
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.handleError(error);
    } finally {
      await queryRunner.release();
    }
  } // TODO Verificar respuesta

  // async updateGroup(user: User, updateGroupDto: UpdateCutomGroupDto, idGroup: number) {
  //   const { accounts, name } = updateGroupDto;
  //   if (accounts) {
  //     const { accounts: accountsHolder } = await this.getMyIndividualAccounts(user);
  //     const isCoorect = accounts.every(acc => accountsHolder.find(ach => ach.CodigoCte === acc.toString()));
  //     if (!isCoorect) throw new BadRequestException('Algunas cuentas no pertenecen al dealer');
  //   }

  //   const group = await this.customGroupService.findOne({ where: { idGroup }, relations: { user: true, accounts: true } });
  //   if (!group) throw new NotFoundException('Grupo no exitente');
  //   if (group.user.id !== user.id) throw new BadRequestException('Operación no valida');

  //   const queryRunner = this.dataSource.createQueryRunner();
  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     if (accounts) {
  //       const accountToDelete = group.accounts.filter(account => !accounts.find(acc => acc === account.idAccount)).map(acc => acc.id);
  //       const accountsToAdd = accounts.filter(account => !group.accounts.find(acc => acc.idAccount === account));
  //       if (accountToDelete.length > 0) {
  //         await queryRunner.manager.delete(GroupAccount, accountToDelete);
  //       }
  //       if (accountsToAdd.length > 0) {
  //         const accoutsSave = accountsToAdd.map(acAd => this.customGroupService.addAccounts( group,  acAd ));
  //         await queryRunner.manager.save(accoutsSave);
  //       }
  //     }
  //     delete group.accounts;
  //     delete group.user;
  //     group.name = name;
  //     await queryRunner.manager.save(group);

  //     await queryRunner.commitTransaction();

  //     return await this.customGroupService.findOne({ where: { idGroup } });
  //   } catch (error) {
  //     await queryRunner.rollbackTransaction();
  //     return this.handleError(error);
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }// TODO Verificar respuesta, y verificar uso de admin

  async getCustomGroup(user: User, id: number) {
    const service = this.servicesServices.getService(user.company.id);
    try {
      const group = await this.customGroupService.findOne({ where: { idGroup: id }, relations: { accounts: true, user: true } });
      if (!group) throw new NotFoundException('Grupo no existente');

      if (!user.roles.includes('admin') && group.user.id !== user.id) throw new BadRequestException('Acción no valida');
      const accountsGroup = group.accounts.map(account => account.idAccount);
      const { accounts } = await firstValueFrom(service.searchAccounts({ accounts: accountsGroup }));

      return {
        name: group.name,
        id: group.idGroup,
        createdBy: group.user.fullName,
        accounts
      };

    } catch (error) {
      this.handleError(error);
    }
  }


  // ? Helpers

  async myAccounts(id: string) {
    const userAccounts = await this.userAccountsRepository.find({ where: { user: { id } } });
    return userAccounts;
  } // * Obtiene las cuentas del usuario (cuentas de la base de datos local (idAccount, typeAccount))

  private missingAccounts(accountsFromGroups: number[], accountsFromCustomGroup: number[], individualAccounts: number[]){ // * Cuentas que faltan por obtener 
    // * Sacar todas las cuentas de grupos custom e individuales (quitar repetidas)
    const uniqueIndividualAccounts = Array.from(new Set([...individualAccounts, ...accountsFromCustomGroup]));

    const accountsQuery = uniqueIndividualAccounts.filter(acc => !accountsFromGroups.includes(acc));

    return accountsQuery;
  }

  private async getAccountsInformation(user: User, service: DbServiceClient, showGroups: boolean = false) {

    // * Obtener las cuentas del usuario y separarlas por tipo
    const userAccounts = await this.myAccounts(user.id);
    const { groupAccounts, customGroupsAccounts, individualAccounts } = this.separateAccounts(userAccounts);

    // * Obtener las cuentas de sus grupos o dealers 
    const { groups } = (groupAccounts.length === 0) ? { groups: [] } : await this.getGroups(groupAccounts, service, true);
    const accountsFromGroups = groups.flatMap(group => group.accounts);

    // * Obtener las cuentas de los grupos custom 
    const accountsFromCustomGroup = (customGroupsAccounts.length === 0 || showGroups === false) ? [] : await this.customGroupService.find({ where: { idGroup: In(customGroupsAccounts) }, relations: { accounts: true } });

    // * Obtener las cuentas que faltan por buscar
    const accountsForQuery = this.missingAccounts(
      accountsFromGroups.map(account => Number(account.CodigoCte)),
      accountsFromCustomGroup.flatMap(account => account.accounts.map(acc => acc.idAccount)),
      individualAccounts
    );

    // * Cuentas faltantes
    const newAccounts = (accountsForQuery.length === 0) ? { accounts: [] } : await this.getAccounts(accountsForQuery, service);

    return {
      accounts: [...newAccounts.accounts, ...accountsFromGroups],
      groups: [...groups, ...accountsFromCustomGroup.map(cgr => {
        const { idGroup, name } = cgr;
        return { Codigo: idGroup, Nombre: name, Tipo: 4 }
      })],
    }

  } // * Proceso para obtener información de las cuentas (individuales y grupales)

  private async getGroupsFormat(groupAccounts: GroupRequest[], customGroupsAccounts: number[], service: DbServiceClient) {
    const { groups } = (groupAccounts.length === 0) ? { groups: [] } : await this.getGroups(groupAccounts, service);

    const customGroups = (customGroupsAccounts.length === 0) ? [] : await this.customGroupService.find({ where: { idGroup: In(customGroupsAccounts) } });

    return {
      groups: [...groups, ...customGroups.map(cgr => {
        const { idGroup, name } = cgr;
        return { Codigo: idGroup, Nombre: name, Tipo: 4 }
      })],

    };
  } // * Formato a las cuentas grupales

  private separateAccounts(userAccounts: UserAccounts[]) {
    const individualAccounts = userAccounts.filter(account => account.typeAccount === 1).map(account => account.idAccount);
    const groupAccounts: GroupRequest[] = userAccounts.filter(account => (account.typeAccount === 2 || account.typeAccount === 3)).map(account => ({ id: account.idAccount, type: account.typeAccount }));
    const customGroupsAccounts = userAccounts.filter(account => account.typeAccount === 4).map(account => account.idAccount);
    return {
      individualAccounts,
      groupAccounts,
      customGroupsAccounts
    }
  } // * separa por tipo (getMyAccounts, getMyIndividualAccounts, getMyGroupsAccounts)  

  private async validIndividualAccounts(accounts: number[], user: User) {
    if (accounts.length === 0) return true;
    const { accounts: userAccounts } = await this.getMyIndividualAccounts(user);
    const isTrue = accounts.every(account => userAccounts.find(acc => acc.CodigoCte === account.toString()));
    if (!isTrue) throw new BadRequestException('Algunas de las cuentas no estan asignadas');
    return true;
  }
  private validGroups(groups: AccountDto[], groupsUser: GroupRequest[]) {
    if (groups.length === 0) return true;
    const isTrue = groups.every(account => groupsUser.find(gr => (gr.id === account.idAccount && gr.type === account.typeAccount)));
    if (!isTrue) throw new BadRequestException('Algunas de las cuentas no estan asignadas');
    return true;
  }

  private async updateMyAccounts(accountsDelete: number[], accountsAdd: AccountDto[], user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (accountsDelete.length > 0) {
        await queryRunner.manager.delete(UserAccounts, accountsDelete);
      }
      if (accountsAdd.length > 0) {
        const accoutsSave = accountsAdd.map(acAd => this.userAccountsRepository.create({ idAccount: acAd.idAccount, typeAccount: acAd.typeAccount, user: user }));
        await queryRunner.manager.save(accoutsSave);
      }

      await queryRunner.commitTransaction();

    } catch (error) {
      await queryRunner.rollbackTransaction();
      return this.handleError(error);
    } finally {
      await queryRunner.release();
    }
  }



  // ? Getter of accounts
  private async getGroups(groups: GroupRequest[], service: DbServiceClient , showAccounts: boolean = false) {
    return await firstValueFrom(service.searchGroups({ groups, includeAccounts: showAccounts, state: "Activas" }));
  }
  private async getAccounts(accounts: number[], service: DbServiceClient) {
    return await firstValueFrom(service.searchAccounts({ accounts, state: 'Activas' }));
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

  // onModuleInit() {
  //   this.dbService = this.client.getService<DbServiceClient>('DbService');

  // }
}
