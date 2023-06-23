import { Inject, Injectable, OnModuleInit, BadRequestException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import * as dayjs from 'dayjs';
import { firstValueFrom } from 'rxjs';
import { AccountEventResponse__Output } from '../../common/interfaces/events/AccountEventResponse';
import { DbServiceClient } from '../../common/interfaces/db/DbService';
import { FilterEvents } from '../../common/interfaces/events/FilterEvents';
import { AccountsService } from '../../accounts/accounts.service';
import { User } from '../../user/entities';
import { Order } from '../../common/interfaces/events/Order';
import { ReportDTO, ReportDatesDTO, ReportDatesDTOv1 } from '../../common/dto';
import { StateBatery } from '../../common/types/batery-state';


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

                const dataBat = this.bateryForAccounts(data[0].cuentas, data[0].Nombre);

                const CSE = dataBat.cuentas.filter(account => account.estado === StateBatery.WITHOUT).map(account => `0 0 ${account.nombre.replace(/\s/g, '***')} ${account.numeroEventos}`);
                const CSR = dataBat.cuentas.filter(account => account.estado === StateBatery.ERROR).map(account => `0 0 ${account.nombre.replace(/\s/g, '***')} ${account.numeroEventos}`);
                const CCR = dataBat.cuentas.filter(account => account.estado === StateBatery.RESTORE).map(account => `0 0 ${account.nombre.replace(/\s/g, '***')} ${account.numeroEventos}`);

                return {
                    status: true,
                    data: {
                        totalCuentas: dataBat.total,
                        Nombre: dataBat.nombre,
                        porcentajes: {
                            CSR: Math.round((CSR.length / dataBat.total) * 100),
                            CCR: Math.round((CCR.length / dataBat.total) * 100),
                            CSE: Math.round((CSE.length / dataBat.total) * 100),
                        },
                        CSE,
                        CSR,
                        CCR
                    }
                }

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
                const papas = data[0].cuentas.flatMap(account => {
                    
                    const fechas = dates.map(date => {
                        if(!account.eventos) return '--:-- --:--';
                        const eventoAp = account.eventos.find(ev => ev.FechaOriginal === date && ['O', 'OS'].includes(ev.CodigoAlarma))?.Hora.substring(0, 5) || '--:--';
                        const eventoCi = (account.eventos?.filter(ev => ev.FechaOriginal === date).length === 0)
                            ?
                            '--:--'
                            :
                            ['C', 'CS'].includes(account.eventos!.filter(ev => ev.FechaOriginal === date)[account.eventos!.filter(ev => ev.FechaOriginal === date).length - 1].CodigoAlarma)
                                ?
                                account.eventos!.filter(ev => ev.FechaOriginal === date)[account.eventos!.filter(ev => ev.FechaOriginal === date).length - 1].Hora.substring(0, 5)
                                :
                                '--:--';
                        return `${eventoAp} ${eventoCi}`;
                    })
                    return `${account.Nombre.replace(/\s/g, '***')} ${fechas.join(' ')}`;
                })
                const apWithHours = data[0].cuentas.reduce((prev, curr) => {
                    let algo: number[] = dates.flatMap(date => {
                        return curr.eventos?.find(ev => ev.FechaOriginal === date && ['O', 'OS'].includes(ev.CodigoAlarma)) ? 1 : 0;
                    })
                    let suma = algo.reduce((a, b) => a + b)
                    return prev + suma;

                }, 0);
                const ciWithHours = data[0].cuentas.reduce((prev, curr) => {
                    let algo: number[] = dates.flatMap(date => {
                        return curr.eventos?.find(ev => ev.FechaOriginal === date && ['C', 'CS'].includes(ev.CodigoAlarma)) ? 1 : 0;
                    })
                    let suma = algo.reduce((a, b) => a + b)
                    return prev + suma;

                }, 0);
                return {
                    status: true,
                    data: {
                        fechasH:{
                            dias: dates.map(date => new Date(Date.UTC(Number(date.split('-')[0]), Number(date.split('-')[1]) - 1, Number(date.split('-')[2]) + 1)).toLocaleString(undefined, { weekday: 'long' }).toString()),
                            fechas: dates,
                        },
                        Nombre: data[0].Nombre,
                        totalAperturas: data[0].cuentas.length * 7,
                        totalCierres: data[0].cuentas.length * 7,
                        porcentajes: {
                            aperturasConHora: apWithHours,
                            aperturasSinHora: data[0].cuentas.length * 7 - apWithHours,
                            cierresConHora: ciWithHours,
                            cierresSinHora: data[0].cuentas.length * 7 - ciWithHours
                        },
                        datos: papas
                    }
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
                return{
                    status: true,
                    data: {
                        Nombre: data[0].Nombre,
                        datos: data[0].cuentas.map(account => {
                            return {
                                nombre: account.Nombre,
                                codigoCte: account.CodigoCte,
                                particion: account.evento ? account.evento.Particion : 1,
                                estado: account.evento ? ['O', 'OS'].includes(account.evento.CodigoAlarma) ?'Abierto' :'Cerrado' : 'Sin actividad',                                
                            }
                        })
                    }
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

    async reportApCI(reportWithDates: ReportDatesDTOv1, user: User) {
        const initialDate = dayjs(reportWithDates.dateEnd);
        if (initialDate.diff(reportWithDates.dateStart, 'days') > 30) throw new BadRequestException('Solo puede consultar 30 días naturales')
        const filter: FilterEvents[] = [{ code: "O", type: "Alarma" }, { code: "OS", type: "Alarma" }, { code: "C", type: "Alarma" }, { code: "CS", type: "Alarma" }];
        try {


            if (reportWithDates.typeAccount === 1) {
                if (!user.roles.includes('admin')) await this.validIndividualAccounts(reportWithDates.accounts, user);
                const { data } = await this.getEventsIndividualAccounts(reportWithDates.accounts, filter, reportWithDates.dateStart, reportWithDates.dateEnd, Order.DESC, false);
                if (reportWithDates.advanced) {
                    return {
                        status: true,
                        data: data.map(account => {
                            return [
                                [account.Nombre, account.Direccion],
                                account.eventos ? 
                                account.eventos.map(evento => {
                                    return {
                                        FechaHora: `${evento.FechaOriginal} ${evento.Hora}.1234`,
                                        DescripcionEvent: evento.DescripcionEvent,
                                        Particion: evento.Particion,
                                        CodigoZona: evento.CodigoUsuario,
                                        NombreUsuario: evento.NombreUsuario,
                                    }
                                }) : [
                                    {
                                        FechaHora: `9000-01-01 00:00:00.0000`,
                                        DescripcionEvent: 'Sin eventos',
                                        Particion: 0,
                                        CodigoZona: 0,
                                        NombreUsuario: 'N/A',
                                    }
                                ]
                            ]
                        })
                    }
                }

                return {
                    status: data[0].eventos ? true: false,
                    data: {
                        nombre:  data[0].Nombre ,
                        direccion: data[0].Direccion,
                        total: data[0].eventos ? data[0].eventos.length: 0,
                        porcentajes: {
                            aperturas: data[0].eventos ? data[0].eventos.filter(evento => ['O', 'OS'].includes(evento.CodigoAlarma)).length : 0,
                            cierres: data[0].eventos ? data[0].eventos.filter(evento => ['C', 'CS'].includes(evento.CodigoAlarma)).length : 0
                        },
                        datos: data[0].eventos ? data[0].eventos.map(evento => {
                            return {
                                FechaHora: `${evento.FechaOriginal} ${evento.Hora}.1234`,
                                DescripcionEvent: evento.DescripcionEvent,
                                Particion: evento.Particion,
                                CodigoZona: evento.CodigoUsuario,
                                NombreUsuario: evento.NombreUsuario,
                            }
                        }) : []
                    }
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
            console.log(error);
            
            this.handleError(error);
        }
    }

    async reportEventoAlarm(reportWithDates: ReportDatesDTOv1, user: User) {
        const initialDate = dayjs(reportWithDates.dateEnd);
        if (initialDate.diff(reportWithDates.dateStart, 'days') > 30) throw new BadRequestException('Solo puede consultar 30 días naturales')
        const filter: FilterEvents[] = [{ code: "1381", type: "Alarma" }, { code: "24H", type: "Alarma" }, { code: "A", type: "Alarma" }, { code: "ACR", type: "Alarma" }, { code: "ACZ", type: "Alarma" }, { code: "AGT", type: "Alarma" }, { code: "ASA", type: "Alarma" }, { code: "AT", type: "Alarma" }, { code: "ATP", type: "Alarma" }, { code: "ATR", type: "Alarma" }, { code: "AUT", type: "Alarma" }, { code: "BB", type: "Alarma" }, { code: "BPS", type: "Alarma" }, { code: "C", type: "Alarma" }, { code: "CAS", type: "Alarma" }, { code: "CN", type: "Alarma" }, { code: "CPA", type: "Alarma" }, { code: "CS", type: "Alarma" }, { code: "CTB", type: "Alarma" }, { code: "ET*", type: "Alarma" }, { code: "FC*", type: "Alarma" }, { code: "FCA", type: "Alarma" }, { code: "FIRE", type: "Alarma" }, { code: "FT", type: "Alarma" }, { code: "FT*", type: "Alarma" }, { code: "GA", type: "Alarma" }, { code: "IA*", type: "Alarma" }, { code: "MED", type: "Alarma" }, { code: "O", type: "Alarma" }, { code: "OS", type: "Alarma" }, { code: "P", type: "Alarma" }, { code: "PA", type: "Alarma" }, { code: "PAF", type: "Alarma" }, { code: "PR", type: "Alarma" }, { code: "PRB", type: "Alarma" }, { code: "RAS", type: "Alarma" }, { code: "REB", type: "Alarma" }, { code: "RES", type: "Alarma" }, { code: "RFC", type: "Alarma" }, { code: "RON", type: "Alarma" }, { code: "S99", type: "Alarma" }, { code: "SAS", type: "Alarma" }, { code: "SMOKE", type: "Alarma" }, { code: "STL", type: "Alarma" }, { code: "SUP", type: "Alarma" }, { code: "TAM", type: "Alarma" }, { code: "TB", type: "Alarma" }, { code: "TEL", type: "Alarma" }, { code: "TESE", type: "Alarma" }, { code: "TESS", type: "Alarma" }, { code: "TPL", type: "Alarma" }, { code: "TRB", type: "Alarma" }, { code: "TST", type: "Alarma" }, { code: "TST0", type: "Alarma" }, { code: "TST1", type: "Alarma" }, { code: "TST3", type: "Alarma" }, { code: "TSTR", type: "Alarma" }, { code: "TX0", type: "Alarma" }, { code: "UR11", type: "Alarma" }, { code: "US11", type: "Alarma" }, { code: "VE", type: "Alarma" }];
        try {
            if (reportWithDates.typeAccount === 1) {
                if (!user.roles.includes('admin')) await this.validIndividualAccounts(reportWithDates.accounts, user);
                const { data } = await this.getEventsIndividualAccounts(reportWithDates.accounts, filter, reportWithDates.dateStart, reportWithDates.dateEnd, Order.DESC, false);
                
                if (reportWithDates.advanced) {
                    return {
                        status: true,
                        data: data.map(account => {
                            return [
                                [account.Nombre, account.Direccion],
                                account.eventos ?
                                    account.eventos.map(evento => {
                                        return {
                                            FechaHora: `${evento.FechaOriginal} ${evento.Hora}.1234`,
                                            Particion: evento.Particion,
                                            DescripcionEvent: evento.DescripcionEvent,
                                            CodigoZona: evento.CodigoUsuario ,
                                            NombreUsuario: evento.NombreUsuario,
                                            Zona: evento.CodigoZona,
                                            NombreZona: evento.DescripcionZona
                                        }
                                    }) : [
                                        {
                                            FechaHora: `9000-01-01 00:00:00.0000`,
                                            DescripcionEvent: 'Sin eventos',
                                            Particion: 0,
                                            CodigoZona: 0,
                                            NombreUsuario: 'N/A',
                                            Zona: '',
                                            NombreZona: ''
                                        }
                                    ]
                            ]
                        })
                    }
                }

                return {
                    status: data[0].eventos ? true : false,
                    data: {
                        Nombre: data[0].Nombre,
                        Direccion: data[0].Direccion,
                        total: data[0].eventos ? data[0].eventos.length : 0,
                        porcentajes: {
                            apci: data[0].eventos ? data[0].eventos.filter(evento => ['O', 'OS','C', 'CS'].includes(evento.CodigoAlarma)).length : 0,
                            alarmas: data[0].eventos ? data[0].eventos.filter(evento => ["A", "ACZ", "ASA", "ATR", "CPA", "FIRE", "GA", "P", "SAS", "SMOKE", "VE"].includes(evento.CodigoAlarma)).length : 0,
                            pruebas: data[0].eventos ? data[0].eventos.filter(evento => ["AGT", "AT", "ATP", "AUT", "TST", "TST0", "TST1", "TST3", "TSTR", "TX0"].includes(evento.CodigoAlarma)).length : 0,
                            baterias: data[0].eventos ? data[0].eventos.filter(evento => ['BB', 'RBB'].includes(evento.CodigoAlarma)).length : 0,
                            otros: data[0].eventos ? data[0].eventos.filter(evento => ["1381", "24H", "ACR", "BPS", "CAS", "CN", "CTB", "ET*", "FC*", "FCA", "FT", "FT*", "IA*", "MED", "PA", "PAF", "PR", "PRB", "RAS", "REB", "RES", "RFC", "RON", "S99", "STL", "SUP", "TAM", "TB", "TEL", "TESE", "TESS", "TPL", "TRB"].includes(evento.CodigoAlarma)).length : 0,

                        },
                        datos: data[0].eventos ? data[0].eventos.map(evento => {
                            return {
                                FechaHora: `${evento.FechaOriginal} ${evento.Hora}.1234`,
                                Particion: evento.Particion,
                                DescripcionEvent: evento.DescripcionEvent,
                                CodigoZona: evento.CodigoUsuario ,
                                NombreUsuario: evento.NombreUsuario,
                                Zona: evento.CodigoZona,
                                NombreZona: evento.DescripcionZona
                            }
                        }) : []
                    }
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
    private async getEventsIndividualAccounts(accounts: number[], filter: FilterEvents[], dateStart: string, dateEnd: string, order: Order, partitions: boolean = true, exclude: boolean = false) {
        return await firstValueFrom(this.dbService.getEventsWithAccounts({ accounts, filters:filter, dateStart, dateEnd, state: "Activas", filterIsExclude: exclude, separatePartitions: partitions, order }));
    }

    private async getEventsGroup(accounts: number[], typeAccount: number, filter: FilterEvents[], dateStart: string, dateEnd: string, order: Order, partitions: boolean = true, exclude: boolean = false) {
        return await firstValueFrom(this.dbService.getEventsFromGroup({ groups: accounts.map( ac => ({id: ac, type: typeAccount})), dateEnd, dateStart, filters: filter, filterIsExclude: exclude, separatePartitions: partitions, state: "Activas", order }));
    }

    private async getTopEventsIndividualAccounts(accounts: number[], filter: FilterEvents[]) {
        return await firstValueFrom(this.dbService.getLasEventFromAccount({ accounts, filters: filter, separatePartitions: true, state: "Activas" }));
    }

    private async getTopEventsGroup(accounts: number[], typeAccount: number, filter: FilterEvents[]) {
        return await firstValueFrom(this.dbService.getLastEventFromGroup({ groups: accounts.map(ac => ({ id: ac, type: typeAccount })), filters: filter, separatePartitions: true, state: "Activas" }));
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
