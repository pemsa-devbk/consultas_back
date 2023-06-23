import { Inject, Injectable, OnModuleInit, BadRequestException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import * as dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';
import { AccountEventResponse__Output } from '../common/interfaces/events/AccountEventResponse';
import { DbServiceClient } from '../common/interfaces/db/DbService';
import { FilterEvents } from '../common/interfaces/events/FilterEvents';
import { AccountsService } from '../accounts/accounts.service';
import { User } from '../user/entities';
import { Order } from '../common/interfaces/events/Order';
import { ReportDTO, ReportDatesDTO } from '../common/dto';
import { StateBatery } from '../common/types/batery-state';


@Injectable()
export class ReportsService implements OnModuleInit {

    private dbService: DbServiceClient;

    constructor(
        @Inject('DB_PACKAGE') private readonly client: ClientGrpc,
        private readonly accountService: AccountsService
    ) { }

    onModuleInit() {
        
        this.dbService = this.client.getService<DbServiceClient>('DbService');
        
    }

    // For reports
    async reportBatery(reportWitOutDates: ReportDTO, user: User) {
        const filter: FilterEvents[] = [{ code: "BB", type: "Alarma" }, { code: "RBB", type: "Alarma" }];
        const endDate = dayjs();
        const startDate = dayjs(endDate).subtract(1, 'month');

        try {
            if (reportWitOutDates.typeAccount === 1) {
                if (!user.roles.includes('admin')) await this.validIndividualAccounts(reportWitOutDates.accounts, user);
                const { data } = await this.getEventsIndividualAccounts(reportWitOutDates.accounts, filter, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), Order.ASC, false);
                return this.bateryForAccounts(data);

            } else if (reportWitOutDates.typeAccount === 2 || reportWitOutDates.typeAccount === 3) { // * Para cuentas grupales
                if (!user.roles.includes('admin')) await this.validGroup(user.id, reportWitOutDates.accounts, reportWitOutDates.typeAccount)
                const { data } = await this.getEventsGroup(reportWitOutDates.accounts, reportWitOutDates.typeAccount, filter, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), Order.ASC, false);
                return this.bateryForAccounts(data[0].cuentas, data[0].Nombre);

            } else {// * Para grupos custom
                if (user.roles.includes('admin')) throw new BadRequestException('Acción no permtiida');
                await this.validCustomGroup(user.id, reportWitOutDates.accounts);
                const accountGr = await this.accountService.findCustomGroup({ where: { idGroup: reportWitOutDates.accounts[0] }, relations: { accounts: true } });
                const accountsC = accountGr.accounts.map(ac => ac.idAccount);
                const { data } = await this.getEventsIndividualAccounts(accountsC, filter, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), Order.ASC, false);
                return this.bateryForAccounts(data, accountGr.name);
            }
        } catch (error) {
            this.handleError(error);
        }
    }
    private bateryForAccounts(accounts: AccountEventResponse__Output[], name: string = "") {
        const accountsWithOutEvent = accounts.filter(eventsAccount => eventsAccount.eventos ? false : true);
        const accountsRestore = accounts.filter(eventsAccount => eventsAccount.eventos ? eventsAccount.eventos[eventsAccount.eventos.length - 1].CodigoAlarma === 'RBB' : false);
        const accountsError = accounts.filter(eventsAccount => eventsAccount.eventos ? eventsAccount.eventos[eventsAccount.eventos.length - 1].CodigoAlarma === 'BB' : false);

        return {
            nombre: name,
            total: accounts.length,
            cuentas: [
                ...accountsError.map(account => ({ nombre: account.Nombre, numeroEventos: account.eventos.filter(ev => ev.CodigoAlarma === 'BB').length, estado: StateBatery.ERROR })),
                ...accountsRestore.map(account => ({ nombre: account.Nombre, numeroEventos: account.eventos.filter(ev => ev.CodigoAlarma === 'BB').length, estado: StateBatery.RESTORE })),
                ...accountsWithOutEvent.map(account => ({ nombre: account.Nombre, numeroEventos: 0, estado: StateBatery.WITHOUT })),
            ]
        };
    }

    async reportApCiWeek(reportWitOutDates: ReportDTO, user: User) {
        const filter: FilterEvents[] = [{ code: "O", type: "Alarma" }, { code: "OS", type: "Alarma" }, { code: "CS", type: "Alarma" }, { code: "C", type: "Alarma" }];
        const endDate = dayjs();
        const startDate = dayjs(endDate).subtract(6, 'days');
        let dates: string[] = [];
        for (let i = 0; i <= 6; i++) {
            dates = [...dates, dayjs(startDate).add(i, 'day').format('YYYY-MM-DD')]
        }

        try {
            if (reportWitOutDates.typeAccount === 1) {
                if (!user.roles.includes('admin')) await this.validIndividualAccounts(reportWitOutDates.accounts, user);
                const { data } = await this.getEventsIndividualAccounts(reportWitOutDates.accounts, filter, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), Order.ASC);
                return {
                    nombre: '',
                    fechas: dates,
                    cuentas: data
                }
            } else if (reportWitOutDates.typeAccount === 2 || reportWitOutDates.typeAccount === 3) {
                if (!user.roles.includes('admin')) await this.validGroup(user.id, reportWitOutDates.accounts, reportWitOutDates.typeAccount)
                const { data } = await this.getEventsGroup(reportWitOutDates.accounts, reportWitOutDates.typeAccount, filter, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), Order.ASC);
                return {
                    nombre: data[0].Nombre,
                    fechas: dates,
                    cuentas: data[0].cuentas
                }
            } else {
                if (user.roles.includes('admin')) throw new BadRequestException('Acción no permitida')
                await this.validCustomGroup(user.id, reportWitOutDates.accounts);
                const accountGr = await this.accountService.findCustomGroup({ where: { idGroup: reportWitOutDates.accounts[0] }, relations: { accounts: true } });
                const accountsC = accountGr.accounts.map(ac => ac.idAccount);
                const { data } = await this.getEventsIndividualAccounts(accountsC, filter, startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'), Order.ASC);
                return {
                    nombre: accountGr.name,
                    fechas: dates,
                    cuentas: data
                }
            }

        } catch (error) {
            this.handleError(error);
        }

    }

    async reportState(reportWitOutDates: ReportDTO, user: User) {
        const filter: FilterEvents[] = [{ code: "O", type: "Alarma" }, { code: "OS", type: "Alarma" }, { code: "C", type: "Alarma" }, { code: "CS", type: "Alarma" }];
        try {
            if (reportWitOutDates.typeAccount === 1) {
                if (!user.roles.includes('admin')) await this.validIndividualAccounts(reportWitOutDates.accounts, user);
                const { data } = await this.getTopEventsIndividualAccounts(reportWitOutDates.accounts, filter);
                return {
                    nombre: '',
                    cuentas: data
                }
            } else if (reportWitOutDates.typeAccount === 2 || reportWitOutDates.typeAccount === 3) {
                if (!user.roles.includes('admin')) await this.validGroup(user.id, reportWitOutDates.accounts, reportWitOutDates.typeAccount)
                const { data } = await this.getTopEventsGroup(reportWitOutDates.accounts, reportWitOutDates.typeAccount, filter);
                return {
                    nombre: data[0].Nombre,
                    cuentas: data[0].cuentas
                }
            } else {
                if (user.roles.includes('admin')) throw new BadRequestException('Acción no permitida')
                await this.validCustomGroup(user.id, reportWitOutDates.accounts);
                const accountGr = await this.accountService.findCustomGroup({ where: { idGroup: reportWitOutDates.accounts[0] }, relations: { accounts: true } });
                const accountsC = accountGr.accounts.map(ac => ac.idAccount);
                const { data } = await this.getTopEventsIndividualAccounts(accountsC, filter);
                return {
                    nombre: accountGr.name,
                    cuentas: data
                }
            }
        } catch (error) {
            return this.handleError(error);
        }
    }

    async reportApCI(reportWithDates: ReportDatesDTO, user: User) {
        const initialDate = dayjs(reportWithDates.dateEnd);
        if (initialDate.diff(reportWithDates.dateStart, 'days') > 30) throw new BadRequestException('Solo puede consultar 30 días naturales')
        const filter: FilterEvents[] = [{ code: "O", type: "Alarma" }, { code: "OS", type: "Alarma" }, { code: "C", type: "Alarma" }, { code: "CS", type: "Alarma" }];
        try {
            if (reportWithDates.typeAccount === 1) {
                if (!user.roles.includes('admin')) await this.validIndividualAccounts(reportWithDates.accounts, user);
                const { data } = await this.getEventsIndividualAccounts(reportWithDates.accounts, filter, reportWithDates.dateStart, reportWithDates.dateEnd, Order.DESC, false);
                return {
                    nombre: '',
                    cuentas: data
                }
            } else if (reportWithDates.typeAccount === 2 || reportWithDates.typeAccount === 3) {
                if (!user.roles.includes('admin')) await this.validGroup(user.id, reportWithDates.accounts, reportWithDates.typeAccount)
                const { data } = await this.getEventsGroup(reportWithDates.accounts, reportWithDates.typeAccount, filter, reportWithDates.dateStart, reportWithDates.dateEnd, Order.DESC, false);

                return {
                    nombre: data[0].Nombre,
                    cuentas: data[0].cuentas
                }
            } else {
                if (user.roles.includes('admin')) throw new BadRequestException('Acción no permitida')
                await this.validCustomGroup(user.id, reportWithDates.accounts);
                const accountGr = await this.accountService.findCustomGroup({ where: { idGroup: reportWithDates.accounts[0] }, relations: { accounts: true } });
                const accountsC = accountGr.accounts.map(ac => ac.idAccount);
                const { data } = await this.getEventsIndividualAccounts(accountsC, filter, reportWithDates.dateStart, reportWithDates.dateEnd, Order.DESC, false);
                return {
                    nombre: accountGr.name,
                    cuentas: data
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    async reportEventoAlarm(reportWithDates: ReportDatesDTO, user: User) {
        const initialDate = dayjs(reportWithDates.dateEnd);
        if (initialDate.diff(reportWithDates.dateStart, 'days') > 30) throw new BadRequestException('Solo puede consultar 30 días naturales')
        const filter: FilterEvents[] = [{ code: "1381", type: "Alarma" }, { code: "24H", type: "Alarma" }, { code: "A", type: "Alarma" }, { code: "ACR", type: "Alarma" }, { code: "ACZ", type: "Alarma" }, { code: "AGT", type: "Alarma" }, { code: "ASA", type: "Alarma" }, { code: "AT", type: "Alarma" }, { code: "ATP", type: "Alarma" }, { code: "ATR", type: "Alarma" }, { code: "AUT", type: "Alarma" }, { code: "BB", type: "Alarma" }, { code: "BPS", type: "Alarma" }, { code: "C", type: "Alarma" }, { code: "CAS", type: "Alarma" }, { code: "CN", type: "Alarma" }, { code: "CPA", type: "Alarma" }, { code: "CS", type: "Alarma" }, { code: "CTB", type: "Alarma" }, { code: "ET*", type: "Alarma" }, { code: "FC*", type: "Alarma" }, { code: "FCA", type: "Alarma" }, { code: "FIRE", type: "Alarma" }, { code: "FT", type: "Alarma" }, { code: "FT*", type: "Alarma" }, { code: "GA", type: "Alarma" }, { code: "IA*", type: "Alarma" }, { code: "MED", type: "Alarma" }, { code: "O", type: "Alarma" }, { code: "OS", type: "Alarma" }, { code: "P", type: "Alarma" }, { code: "PA", type: "Alarma" }, { code: "PAF", type: "Alarma" }, { code: "PR", type: "Alarma" }, { code: "PRB", type: "Alarma" }, { code: "RAS", type: "Alarma" }, { code: "REB", type: "Alarma" }, { code: "RES", type: "Alarma" }, { code: "RFC", type: "Alarma" }, { code: "RON", type: "Alarma" }, { code: "S99", type: "Alarma" }, { code: "SAS", type: "Alarma" }, { code: "SMOKE", type: "Alarma" }, { code: "STL", type: "Alarma" }, { code: "SUP", type: "Alarma" }, { code: "TAM", type: "Alarma" }, { code: "TB", type: "Alarma" }, { code: "TEL", type: "Alarma" }, { code: "TESE", type: "Alarma" }, { code: "TESS", type: "Alarma" }, { code: "TPL", type: "Alarma" }, { code: "TRB", type: "Alarma" }, { code: "TST", type: "Alarma" }, { code: "TST0", type: "Alarma" }, { code: "TST1", type: "Alarma" }, { code: "TST3", type: "Alarma" }, { code: "TSTR", type: "Alarma" }, { code: "TX0", type: "Alarma" }, { code: "UR11", type: "Alarma" }, { code: "US11", type: "Alarma" }, { code: "VE", type: "Alarma" }];
        try {
            if (reportWithDates.typeAccount === 1) {
                if (!user.roles.includes('admin')) await this.validIndividualAccounts(reportWithDates.accounts, user);
                const { data } = await this.getEventsIndividualAccounts(reportWithDates.accounts, filter, reportWithDates.dateStart, reportWithDates.dateEnd, Order.DESC, false);
                return {
                    nombre: '',
                    cuentas: data
                }
            } else if (reportWithDates.typeAccount === 2 || reportWithDates.typeAccount === 3) {
                if (!user.roles.includes('admin')) await this.validGroup(user.id, reportWithDates.accounts, reportWithDates.typeAccount)
                const { data } = await this.getEventsGroup(reportWithDates.accounts, reportWithDates.typeAccount, filter, reportWithDates.dateStart, reportWithDates.dateEnd, Order.DESC, false);
                return {
                    nombre: data[0].Nombre,
                    cuentas: data[0].cuentas
                }
            } else {
                if (user.roles.includes('admin')) throw new BadRequestException('Acción no permitida');
                await this.validCustomGroup(user.id, reportWithDates.accounts);
                const accountGr = await this.accountService.findCustomGroup({ where: { idGroup: reportWithDates.accounts[0] }, relations: { accounts: true } });
                const accountsC = accountGr.accounts.map(ac => ac.idAccount);
                const { data } = await this.getEventsIndividualAccounts(accountsC, filter, reportWithDates.dateStart, reportWithDates.dateEnd, Order.DESC, false);
                return {
                    nombre: accountGr.name,
                    cuentas: data
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    // * 👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌👌

    // * Private methods for validate
    async validIndividualAccounts(accounts: number[], user: User) {
        const { accounts: userAccounts } = await this.accountService.getMyIndividualAccounts(user);
        const isTrue = accounts.every(account => userAccounts.find(acc => acc.CodigoCte === account.toString()));
        if (!isTrue) throw new BadRequestException('Algunas de las cuentas no estan asignadas');
    }

    async validGroup(id: string, accounts: number[], typeAccount: number) {
        const userAccounts = await this.accountService.myAccounts(id);
        const groupAccounts = userAccounts.filter(account => (account.typeAccount === 2 || account.typeAccount === 3)).map(account => ({ id: account.idAccount, type: account.typeAccount }));
        const isTrue = accounts.every(account => groupAccounts.find(gr => (gr.id === account && gr.type === typeAccount)));
        if (!isTrue) throw new BadRequestException('Algunas de las cuentas no estan asignadas');
    }

    async validCustomGroup(id: string, accounts: number[]) {
        const userAccounts = await this.accountService.myAccounts(id);
        const customGroupsAccounts = userAccounts.filter(account => account.typeAccount === 4).map(account => account.idAccount);
        const isTrue = accounts.every(account => customGroupsAccounts.find(gr => gr === account));
        if (!isTrue) throw new BadRequestException('Algunas de las cuentas no estan asignadas');
    }

    // * Private method for get data
    private async getEventsIndividualAccounts(accounts: number[], filters: FilterEvents[], dateStart: string, dateEnd: string, order: Order, separatePartitions: boolean = true, filterIsExclude: boolean = false) {
        return await firstValueFrom(this.dbService.getEventsWithAccounts({ accounts, filters, dateStart, dateEnd, state: "Activas", filterIsExclude, separatePartitions, order }));
    }

    private async getEventsGroup(accounts: number[], typeAccount: number, filters: FilterEvents[], dateStart: string, dateEnd: string, order: Order, separatePartitions: boolean = true, filterIsExclude: boolean = false) {
        return await firstValueFrom(this.dbService.getEventsFromGroup({ groups: accounts.map(ac => ({ id: ac, type: typeAccount })), dateEnd, dateStart, filters, filterIsExclude, separatePartitions, state: "Activas", order }));
    }

    private async getTopEventsIndividualAccounts(accounts: number[], filters: FilterEvents[]) {
        return await firstValueFrom(this.dbService.getLasEventFromAccount({ accounts, filters, separatePartitions: true, state: "Activas" }));
    }

    private async getTopEventsGroup(accounts: number[], typeAccount: number, filters: FilterEvents[]) {
        return await firstValueFrom(this.dbService.getLastEventFromGroup({ groups: accounts.map(ac => ({ id: ac, type: typeAccount })), filters, separatePartitions: true, state: "Activas" }));
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
