import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DbServiceClient } from '../common/interfaces/db/DbService';
import { UserService } from 'src/user/user.service';
import { DataSource, FindOneOptions, In, Repository } from 'typeorm';
import { User } from '../user/entities';
import { AccountDto, AddAccountDto, CreateGroupDto, UpdateGroupDto } from './dto';
import { CustomGroup, GroupAccount, UserAccounts } from './entities';
import { firstValueFrom, forkJoin } from 'rxjs';
import { GroupRequest } from '../common/interfaces/groups/GroupRequest';
import { Account__Output } from '../common/interfaces/accounts/Account';

@Injectable()
export class AccountsService implements OnModuleInit {

    private dbService: DbServiceClient;

    constructor(
        @InjectRepository(UserAccounts)
        private readonly userAccountsRepository: Repository<UserAccounts>,
        @InjectRepository(CustomGroup)
        private readonly groupRepository: Repository<CustomGroup>,
        @InjectRepository(GroupAccount)
        private readonly groupAccountsRepository: Repository<GroupAccount>,
        private readonly userService: UserService,
        private readonly dataSource: DataSource,
        @Inject('DB_PACKAGE') private readonly client: ClientGrpc
    ) { }

    onModuleInit() {
        this.dbService = this.client.getService<DbServiceClient>('DbService');
        
    }

    async getMyAccounts(user: User) {
        if (user.roles.includes('admin')) { // * Mostrartodas las cuentas 
            try {
                const queries = forkJoin([
                    this.dbService.searchAccounts({ state: "Activas" }),
                    this.dbService.searchGroups({}),
                ]);
                const [accounts, groups] = await firstValueFrom(queries);
                return {
                    accounts: accounts.accounts,
                    groups: groups.groups
                }
            } catch (error) {
                this.handleError(error);
            }
        }

        try {
            const userAccounts = await this.myAccounts(user.id);
            const { groupAccounts, customGroupsAccounts, individualAccounts } = this.separateAccounts(userAccounts);

            // * Peticion de las cuentas de un grupo 
            const { groups } = (groupAccounts.length === 0) ? { groups: [] } : await this.getGroups(groupAccounts, true);

            const accountsFromGroups = groups.flatMap(group => group.accounts);

            const accountsFromCustomGroup = (customGroupsAccounts.length === 0) ? [] : await this.groupRepository.find({ where: { idGroup: In(customGroupsAccounts) }, relations: { accounts: true } });

            const { accounts } = await this.getIndividualAccounts(accountsFromGroups, accountsFromCustomGroup, individualAccounts);

            return {
                accounts: [...accounts, ...accountsFromGroups],
                groups: [...groups, ...accountsFromCustomGroup.map(cgr => {
                    const { idGroup, name } = cgr;
                    return { Codigo: idGroup, Nombre: name, Tipo: 4 }
                })],

            };
        } catch (error) {
            this.handleError(error);
        }

    }

    async getMyIndividualAccounts(user: User) {
        if (user.roles.includes('admin')) { // * Admin Mostrar todas las cuentas
            try {
                const accounts = await firstValueFrom(this.dbService.searchAccounts({state: 'Activas'}));
                return {
                    accounts: accounts.accounts
                }
            } catch (error) {
                this.handleError(error);
            }
        }

        try {
            const userAccounts = await this.myAccounts(user.id);
            
            const { groupAccounts, customGroupsAccounts, individualAccounts } = this.separateAccounts(userAccounts);
            
            // * Peticion de las cuentas de un grupo 
            const { groups } = (groupAccounts.length === 0) ? { groups: [] } : await this.getGroups(groupAccounts, true);
            const accountsFromGroups = groups.flatMap(group => group.accounts);
            
            
            const accountsFromCustomGroup = (customGroupsAccounts.length === 0) ? [] : await this.groupRepository.find({ where: { idGroup: In(customGroupsAccounts) }, relations: { accounts: true } })
            
            const { accounts } = await this.getIndividualAccounts(accountsFromGroups, accountsFromCustomGroup, individualAccounts);

            return {
                accounts: [...accounts, ...accountsFromGroups],
            }

        } catch (error) {
            console.log(error);
            
            this.handleError(error);
        }
    }

    async getMyGroupsAccounts(user: User) {
        if (user.roles.includes('admin')) {
            try {
                const groups = await firstValueFrom(this.dbService.searchGroups({}));
                return {
                    groups: groups.groups
                }
            } catch (error) {
                this.handleError(error);
            }

        }

        try {
            const userAccounts = await this.myAccounts(user.id);
            const { groupAccounts, customGroupsAccounts } = this.separateAccounts(userAccounts);

            return await this.getGroupsFormat(groupAccounts, customGroupsAccounts);
        } catch (error) {
            this.handleError(error);
        }


    }

    async getAccountsForUser(user: User, id: string) {
        try {
            const userGet = await this.userService.find({ where: { id }, relations: { createdBy: true } });
            if (!userGet) throw new NotFoundException('Usuario no existente');
            if (!user.roles.includes('admin')) {
                if (userGet.createdBy.id !== user.id) throw new BadRequestException('Operación no valida');
            }
            const userAccounts = await this.myAccounts(id);
            
            const { groupAccounts, customGroupsAccounts, individualAccounts } = this.separateAccounts(userAccounts);

            const [accounts, groups] = await Promise.all([
                (individualAccounts.length === 0) ? { accounts: [] } : this.getAccounts(individualAccounts),
                (groupAccounts.length === 0 && customGroupsAccounts.length === 0) ? { groups: [] } : this.getGroupsFormat(groupAccounts, customGroupsAccounts)
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



    async createCustomGroup(user: User, createGroupDto: CreateGroupDto) {

        const { accounts } = await this.getMyIndividualAccounts(user);

        const isCoorect = createGroupDto.accounts.every(acc => accounts.find(ach => ach.CodigoCte === acc.toString()));

        if (!isCoorect) throw new BadRequestException('Algunas cuentas no estan asignadas');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const newGroup = this.groupRepository.create({
                name: createGroupDto.name,
                user,
                accounts: createGroupDto.accounts.map(account => this.groupAccountsRepository.create({ idAccount: account }))
            });
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

    async updateGroup(user: User, updateGroupDto: UpdateGroupDto, idGroup: number) {
        const { accounts, name } = updateGroupDto;
        if (accounts) {
            const { accounts: accountsHolder } = await this.getMyIndividualAccounts(user);
            const isCoorect = accounts.every(acc => accountsHolder.find(ach => ach.CodigoCte === acc.toString()));
            if (!isCoorect) throw new BadRequestException('Algunas cuentas no pertenecen al dealer');
        }

        const group = await this.findCustomGroup({ where: { idGroup }, relations: { user: true, accounts: true } });
        if (!group) throw new NotFoundException('Grupo no exitente');
        if (group.user.id !== user.id) throw new BadRequestException('Operación no valida');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (accounts) {
                const accountToDelete = group.accounts.filter(account => !accounts.find(acc => acc === account.idAccount)).map(acc => acc.id);
                const accountsToAdd = accounts.filter(account => !group.accounts.find(acc => acc.idAccount === account));
                if (accountToDelete.length > 0) {
                    await queryRunner.manager.delete(GroupAccount, accountToDelete);
                }
                if (accountsToAdd.length > 0) {
                    const accoutsSave = accountsToAdd.map(acAd => this.groupAccountsRepository.create({ group, idAccount: acAd }));
                    await queryRunner.manager.save(accoutsSave);
                }
            }
            delete group.accounts;
            delete group.user;
            group.name = name;
            await queryRunner.manager.save(group);

            await queryRunner.commitTransaction();

            return await this.findCustomGroup({ where: { idGroup } });
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return this.handleError(error);
        } finally {
            await queryRunner.release();
        }
    }// TODO Verificar respuesta, y verificar uso de admin

    async getCustomGroup(user: User, id: number) {
        try {
            const group = await this.findCustomGroup({ where: { idGroup: id }, relations: { accounts: true, user: true } });
            if (!group) throw new NotFoundException('Grupo no existente');

            if (!user.roles.includes('admin') && group.user.id !== user.id) throw new BadRequestException('Acción no valida');
            const accountsGroup = group.accounts.map(account => account.idAccount);
            const { accounts } = await firstValueFrom(this.dbService.searchAccounts({ accounts: accountsGroup }));

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

    async findCustomGroup(options: FindOneOptions<CustomGroup>) {
        return this.groupRepository.findOne(options)
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

    private async getGroupsFormat(groupAccounts: GroupRequest[], customGroupsAccounts: number[]) {
        const { groups } = (groupAccounts.length === 0) ? { groups: [] } : await this.getGroups(groupAccounts);

        const customGroups = (customGroupsAccounts.length === 0) ? [] : await this.groupRepository.find({ where: { idGroup: In(customGroupsAccounts) } });

        return {
            groups: [...groups, ...customGroups.map(cgr => {
                const { idGroup, name } = cgr;
                return { Codigo: idGroup, Nombre: name, Tipo: 4 }
            })],

        };
    }

    async myAccounts(id: string) {
        const userAccounts = await this.userAccountsRepository.find({ where: { user: { id } } });
        return userAccounts;
    } // * Obtiene las cuentas del usuario
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

    private async getIndividualAccounts(accountsFromGroups: Account__Output[], accountsFromCustomGroup: CustomGroup[], individualAccounts: number[]) {

        // * Sacar todas las cuentas de grpos custom e individuales (quitar repetidas)
        const uniqueIndividualAccounts = Array.from(new Set([...individualAccounts, ...accountsFromCustomGroup.flatMap(account => account.accounts.map(acc => acc.idAccount))]));

        const accountsQuery = uniqueIndividualAccounts.filter(acc => (accountsFromGroups.findIndex(account => Number(account.CodigoCte) === acc) === -1));
        
        const accounts = (accountsQuery.length === 0) ? { accounts: [] } : await firstValueFrom(this.dbService.searchAccounts({ accounts: accountsQuery, state: "Activas" }));

        return accounts.accounts ? accounts : {accounts: []};
    } // * Proceso para obtener las cuentas individuales faltantes (getMyAccounts, getMyIndividualAccounts)

    private async getGroups(groups: GroupRequest[], showAccounts: boolean = false) {
        return await firstValueFrom(this.dbService.searchGroups({ groups, includeAccounts: showAccounts, state: "Activas" }));
    }
    private async getAccounts(accounts: number[]) {
        return await firstValueFrom(this.dbService.searchAccounts({ accounts, state: 'Activas' }));
    }

    private handleError(error: any): never {
        // console.error(error);
        if (error.details) throw new InternalServerErrorException(error.details);
        if (error.code === '23505') throw new BadRequestException(error.detail);
        if (error.response) {
            const { message, statusCode } = error.response;
            throw new HttpException(message, statusCode)
        }
        throw new InternalServerErrorException('Please check server logs');
    }

}
