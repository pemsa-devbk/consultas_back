// import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
// import { ClientGrpc } from '@nestjs/microservices';
// import { InjectRepository } from '@nestjs/typeorm';
// import { DbServiceClient } from '../common/interfaces/db/DbService';
// import { UserService } from 'src/user/user.service';
// import { DataSource, In, Repository } from 'typeorm';
// import { User } from '../user/entities';
// import { AccountDto, CreateGroupDto, UpdateGroupDto } from './dto';
// import { CustomGroup, GroupAccount, UserAccounts } from './entities';
// import { firstValueFrom, forkJoin } from 'rxjs';
// import { GroupRequest } from '../common/interfaces/groups/GroupRequest';

// @Injectable()
// export class AccountsService implements OnModuleInit {

//   private dbService: DbServiceClient;

//   constructor(
//     @InjectRepository(UserAccounts)
//     private readonly userAccountsRepository: Repository<UserAccounts>,
//     @InjectRepository(CustomGroup)
//     private readonly groupRepository: Repository<CustomGroup>,
//     @InjectRepository(GroupAccount)
//     private readonly groupAccountsRepository: Repository<GroupAccount>,
//     private readonly userService: UserService,
//     private readonly dataSource: DataSource,
//     @Inject('DB_PACKAGE') private readonly client: ClientGrpc
//   ) { }

//   onModuleInit() {
//     this.dbService = this.client.getService<DbServiceClient>('DbService');
//   }

//   async getMyAccounts(user: User) {
//     if (user.roles.includes('admin')) {
//       try {

//         const queries = forkJoin([
//           this.dbService.AllAccounts({ state: "Activas" }),
//           this.dbService.AllGroups({}),
//         ]);
//         const [accounts, groups] = await firstValueFrom(queries);
//         return {
//           accounts: accounts.accounts,
//           groups: groups.groups
//         }

//       } catch (error) {
//         throw this.handleError(error);
//       }
//     } else {
//       try {
//         return await this.getMyAccountsMW(user.id)
//       } catch (error) {
//         this.handleError(error);
//       }
//     }
//   }

//   async createCustomGroup(user: User, createGroupDto: CreateGroupDto) {

//     const { accounts: accountsHolder } = await this.getMyAccountsMW(user.id);

//     const isCoorect = createGroupDto.accounts.every(acc => accountsHolder.find(ach => ach.CodigoCte === acc.toString()));

//     if (!isCoorect) throw new BadRequestException('Algunas cuentas no pertenecen al dealer');

//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const newGroup = this.groupRepository.create({
//         name: createGroupDto.name,
//         user,
//         accounts: createGroupDto.accounts.map(account => this.groupAccountsRepository.create({ idAccount: account }))
//       });
//       await queryRunner.manager.save(newGroup);

//       const assigGroup = this.userAccountsRepository.create({
//         user,
//         idAccount: newGroup.idGroup,
//         typeAccount: 4
//       });

//       await queryRunner.manager.save(assigGroup);

//       await queryRunner.commitTransaction();

//       return {
//         data: {
//           idGroup: newGroup.idGroup,
//           name: newGroup.name
//         }
//       };
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       return this.handleError(error);
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   // * Se deben enviar todas las cuentas 
//   async updateGroup(user: User, updateGroupDto: UpdateGroupDto, idGroup: number) {

//     const { accounts, name } = updateGroupDto;

//     if (accounts) {
//       const { accounts: accountsHolder } = await this.getMyAccountsMW(user.id);
//       const isCoorect = accounts.every(acc => accountsHolder.find(ach => ach.CodigoCte === acc.toString()));
//       if (!isCoorect) throw new BadRequestException('Algunas cuentas no pertenecen al dealer');
//     }

//     const group = await this.groupRepository.findOne({ where: { idGroup }, relations: { accounts: true, user: true } });

//     if (!group) throw new NotFoundException(`Gupo no existente`);

//     if (group.user.id !== user.id) throw new BadRequestException('Grupo no perteneciente al dealer');

//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();
//     try {
//       if (updateGroupDto.accounts) {
//         const accountToDelete = group.accounts.filter(account => !accounts.find(acc => acc === account.idAccount)).map(acc => acc.id);
//         const accountsToAdd = accounts.filter(account => !group.accounts.find(acc => acc.idAccount === account));
//         if (accountToDelete.length > 0) {
//           await queryRunner.manager.delete(GroupAccount, accountToDelete);
//         }
//         if (accountsToAdd.length > 0) {
//           const accoutsSave = accountsToAdd.map(acAd => this.groupAccountsRepository.create({ group, idAccount: acAd }));
//           await queryRunner.manager.save(accoutsSave);
//         }
//       }

//       delete group.accounts;
//       delete group.user;
//       group.name = name;
//       await queryRunner.manager.save(group);

//       await queryRunner.commitTransaction();

//       return {
//         data: await this.groupRepository.findOne({ where: { idGroup }, relations: { accounts: true } })
//       }

//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       return this.handleError(error);
//     } finally {
//       await queryRunner.release();
//     }

//   }

//   async getCustomGroup(user: User, id: number) {
//     const group = await this.groupRepository.findOne({ where: { idGroup: id }, relations: { accounts: true, user: true } });
//     if (user.roles.includes['admin']) {// * Mostrar la informacion del grupo
//       return group;
//     } else { // * Validar que el grupo le pertenezca
//       if (group.user.id !== user.id) throw new BadRequestException('No tiene derecho a esta accion');
//       delete group.user;
//       return group;
//     }
//   }

//   async getAccountsOfUser(user: User, id: string) {
//     try {
//       const userGet = await this.userService.findUser({ where: { id }, relations: { createdBy: true } });
//       if (!userGet) throw new NotFoundException('Usuario no existente');
//       if (user.roles.includes('admin')) {
//         const accountsForUser = await this.myDBAccounts(id);
        
//         const indivudualAccounts = accountsForUser.filter(account => account.typeAccount === 1).map(acc => acc.idAccount);
//         const groupsAccounts = accountsForUser.filter(account => (account.typeAccount === 2 || account.typeAccount === 3)).map(acc => ({ id: Number(acc.idAccount), type: acc.typeAccount }));
//         const customGRAccounts = accountsForUser.filter(account => account.typeAccount === 4).map(acc => Number(acc.idAccount));
        

//         const accounts = (indivudualAccounts.length === 0) ? { accounts: [] } : await firstValueFrom(this.dbService.searchAccounts({ accounts: indivudualAccounts, state: "Activas" }));
//         const grupos = (indivudualAccounts.length === 0) ? { groups: [] } : await firstValueFrom(this.dbService.searchGroups({ groups: groupsAccounts }));
//         const customGroups = (customGRAccounts.length === 0) ? [] : await this.groupRepository.find({
//           where: {
//             idGroup: In(customGRAccounts)
//           }
//         });

//         return {
//           accounts: [...accounts.accounts],
//           groups: [...grupos.groups, ...customGroups.map(cgr => {
//             const { idGroup, name } = cgr;
//             return { Codigo: idGroup, Nombre: name, Tipo: 4 }
//           })],
    
//         };

        
//       } else {
//         if (userGet.createdBy.id !== user.id) throw new BadRequestException('Operación no valida');
//         const accountsForUser = await this.myDBAccounts(id);
//         const indivudualAccounts = accountsForUser.filter(account => account.typeAccount === 1).map(acc => acc.idAccount);
//         const groupsAccounts = accountsForUser.filter(account => (account.typeAccount === 2 || account.typeAccount === 3)).map(acc => ({ id: Number(acc.idAccount), type: acc.typeAccount }));
//         const customGRAccounts = accountsForUser.filter(account => account.typeAccount === 4).map(acc => Number(acc.idAccount));;

//         const accounts = (indivudualAccounts.length === 0) ? { accounts: [] } : await firstValueFrom(this.dbService.searchAccounts({ accounts: indivudualAccounts, state: "Activas" }));
//         const grupos = (indivudualAccounts.length === 0) ? { groups: [] } : await firstValueFrom(this.dbService.searchGroups({ groups: groupsAccounts }));
//         const customGroups = (customGRAccounts.length === 0) ? [] : await this.groupRepository.find({
//           where: {
//             idGroup: In(customGRAccounts)
//           }
//         });

//         return {
//           accounts: [...accounts.accounts],
//           groups: [...grupos.groups, ...customGroups.map(cgr => {
//             const { idGroup, name } = cgr;
//             return { Codigo: idGroup, Nombre: name, Tipo: 4 }
//           })],
    
//         };
//       }
//     } catch (error) {
//       this.handleError(error);
//     }
//   }

//   // TODO Verificar retorno
//   async updateAccounts(idUser: string, user: User, accounts: AccountDto[]) {

//     const userToAdd = await this.userService.findUser({ where: { id: idUser }, relations: { accounts: true, createdBy: true } });

//     if (!userToAdd) throw 'Usuario no existente';

//     const accountToDelete = userToAdd.accounts.filter(account => !accounts.find(acc => acc.typeAccount === account.typeAccount && acc.idAccount === account.idAccount)).map(acc => acc.id);
//     const accountsToAdd: AccountDto[] = accounts.filter(account => !userToAdd.accounts.find(acc => acc.typeAccount === account.typeAccount && acc.idAccount === account.idAccount));

//     if (user.roles.includes('admin')) {
//       await this.updateMyAccounts(accountToDelete, accountsToAdd, userToAdd);
//     } else {
//       if (userToAdd.roles.includes('holder')) throw new BadRequestException('Accion no permitida');
//       if (userToAdd.createdBy.id !== user.id) throw new BadRequestException('Operación no valida');

//       const { accounts: accountsHolder, groups: groupsHolder } = await this.getMyAccountsMW(user.id);

//       const individualAdd = accounts.filter(acc => acc.typeAccount === 1);
//       const groupAdd = accounts.filter(acc => acc.typeAccount > 1);

//       const isCoorectIN = individualAdd.every(acc => accountsHolder.find(ach => ach.CodigoCte === acc.idAccount.toString()));
//       const isCoorectGR = groupAdd.every(acc => groupsHolder.find(ach => (ach.Codigo === Number(acc.idAccount) && ach.Tipo === acc.typeAccount)));

//       if (!isCoorectIN || !isCoorectGR) {
//         throw new BadRequestException('Alguna de las cuentas no pertenecen al dealer');
//       }
//       await this.updateMyAccounts(accountToDelete, accountsToAdd, userToAdd);
//     }

//     return {
//       data: await this.userService.findUser({ where: { id: idUser }, relations: { accounts: true } })
//     }


//   }

//   private async updateMyAccounts(accountsDelete: number[], accountsAdd: AccountDto[], user: User) {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       if (accountsDelete.length > 0) {
//         await queryRunner.manager.delete(UserAccounts, accountsDelete);
//       }
//       if (accountsAdd.length > 0) {
//         const accoutsSave = accountsAdd.map(acAd => this.userAccountsRepository.create({ idAccount: acAd.idAccount, typeAccount: acAd.typeAccount, user: user }));
//         await queryRunner.manager.save(accoutsSave);
//       }

//       await queryRunner.commitTransaction();

//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       return this.handleError(error);
//     } finally {
//       await queryRunner.release();
//     }
//   }

//   // *********************** TODO OK 
//   private async myDBAccounts(id: string) {
//     return await this.userAccountsRepository.find({
//       where: {
//         user: {
//           id: id
//         }
//       }
//     });
//   }
//   private async getMyAccountsMW(id: string) {

//     const userAccounts = await this.myDBAccounts(id);

//     const individualAccounts = userAccounts.filter(acc => acc.typeAccount === 1).map(acc => acc.idAccount);
//     const groupsUser = userAccounts.filter(acc => (acc.typeAccount === 3 || acc.typeAccount === 2)).map(acc => ({ id: Number(acc.idAccount), type: acc.typeAccount }));
//     const customGroupsUser = userAccounts.filter(acc => acc.typeAccount === 4).map(acc => Number(acc.idAccount));
    
    
    
//     // ? Solicitar los grupos con cuentas 
//     const groups = (groupsUser.length === 0) ? [] : await this.accountsFromMyGroups(groupsUser);
//     const groupResponse = groups.map(gr => {
//       const { accounts, ...rest } = gr;
//       return rest;
//     });
//     const allAccountsFromGroups = groups.flatMap(gr => gr.accounts);
    
//     // ? Sacar las cuentas individuales del custom group
//     const customGroups = (customGroupsUser.length === 0) ? [] : await this.groupRepository.find({
//       where: {
//         idGroup: In(customGroupsUser)
//       },
//       relations: {
//         accounts: true
//       }
//     });
    
//     const accountsForCustomGroups = customGroups.flatMap(gr => gr.accounts.map(acc => acc.idAccount));
    
//     // ? Verificicar que cuentas individualesfaltan y solicitarlas
//     const uniqueAccounts = Array.from(new Set([...accountsForCustomGroups, ...individualAccounts]));
//     const accountsQuery = uniqueAccounts.filter(acc => (allAccountsFromGroups.findIndex(account => account.CodigoCte === acc.toString()) === -1));
    
//     const accounts = (accountsQuery.length === 0) ? { accounts: [] } : await firstValueFrom(this.dbService.searchAccounts({ accounts: accountsQuery, state: "Activas" }));    

//     return {
//       accounts: [...accounts.accounts, ...allAccountsFromGroups],
//       groups: [...groupResponse, ...customGroups.map(cgr => {
//         const { idGroup, name } = cgr;
//         return { Codigo: idGroup, Nombre: name, Tipo: 4 }
//       })],

//     };

//   }
//   private async accountsFromMyGroups(groups: GroupRequest[]) {
//     const response = await firstValueFrom(this.dbService.searchGroups({ groups: groups, showAccounts: true, state: "Activas" }));
//     return response.groups;
//   }

//   private handleError(error: any): never {
//     if (error.details) throw new InternalServerErrorException(error.details);
//     if (error.code === '23505') throw new BadRequestException(error.detail);
//     if (error.response) {
//       const { message, statusCode } = error.response;
//       throw new HttpException(message, statusCode)
//     }
//     console.error(error);

//     throw new InternalServerErrorException('Please check server logs');
//   }

// }
