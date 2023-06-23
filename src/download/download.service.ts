import { Injectable } from '@nestjs/common';
import { ReportsService } from '../reports/reports.service';
import { User } from '../user/entities/user.entity';
import { ReportDTO } from '../common/dto/report.dto';
import jsPDF from 'jspdf';
import { addHeader, createGraph, addFoother, createGraphComparative } from './utilities/pdf';
import { getPercentaje } from './utilities/percentage';
import { RowInput } from 'jspdf-autotable';
import { StateBatery } from '../common/types/batery-state';
import autoTable from 'jspdf-autotable';
import { ReportDatesDTO } from '../common/dto/report-dates.dto';
import * as ExcelJS from 'exceljs';
import { addHeaderXLS, printData, printTableHead, printValue, styleColum } from './utilities/xls';



@Injectable()
export class DownloadService {
  constructor(
    private readonly reportService: ReportsService
  ) { }

  async bateryPDF(report: ReportDTO, user: User) {
    const rp = await this.reportService.reportBatery(report, user);
    const doc = new jsPDF({
      orientation: 'landscape',
      compress: true
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let positionTable: number = 60;


    addHeader(doc, 'ESTADO DE BATERÍAS', 'Reporte generado el:', rp.nombre, rp?.cuentas.length || 0, pageWidth, `${new Date().toLocaleString()} hora de la central.`);
    if (report.showGraphs) {
      positionTable = 118;
      const error = getPercentaje(rp.cuentas.filter(account => account.estado === StateBatery.ERROR).length, rp.cuentas.length);
      const withRestore = getPercentaje(rp.cuentas.filter(account => account.estado === StateBatery.RESTORE).length, rp.cuentas.length);
      const withOut = getPercentaje(rp.cuentas.filter(account => account.estado === StateBatery.WITHOUT).length, rp.cuentas.length);
      createGraph(doc, [
        { ...error, rgb: { r: 255, g: 119, b: 130 }, textHelph: 'SUCURSALES SIN RESTAURE DE BATERÍA BAJA' },
        { ...withRestore, rgb: { r: 223, g: 211, b: 43 }, textHelph: 'SUCURSALES CON RESTAURE DE BATERÍA BAJA' },
        { ...withOut, rgb: { r: 58, g: 207, b: 158 }, textHelph: 'SUCURSALES SIN EVENTO DE BATERÍA BAJA' }
      ]);
    }
    const body: RowInput[] = rp.cuentas.map((account, idx) => {
      const color = (account.estado === StateBatery.WITHOUT)
        ?
        '#41f1b6'
        :
        (account.estado === StateBatery.ERROR)
          ? '#ff7782'
          : '#ffbb55';
      return [
        idx + 1,
        account.nombre,
        {
          content: (account.estado === StateBatery.WITHOUT)
            ?
            'Sin eventos'
            :
            (account.estado === StateBatery.RESTORE)
              ?
              'Con restaure'
              :
              'Sin Restaure'
          ,
          styles: {
            textColor: color,
            fontStyle: 'bold'
          }
        },
        account.numeroEventos
      ]
    }) || [];

    autoTable(doc, {
      head: [['#', 'Nombre', 'Estado', 'Eventos recibidos']],
      startY: positionTable,
      body,
      theme: 'striped',
      headStyles: {
        fontStyle: 'bold',
        fillColor: '#000066',
        textColor: '#fff',
      }
    })

    addFoother(doc, pageWidth, pageHeight);
    return doc.output('arraybuffer')
  }

  async bateryXLSX(report: ReportDTO, user: User){
    const rp = await this.reportService.reportBatery(report, user);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PEMSA";
    const sheet = workbook.addWorksheet(`Batería ${rp.nombre}`);

    // Encabezado del docuemnto
    addHeaderXLS(workbook, sheet, 'ESTADO DE BATERÍAS', 'Reporte generado el:', rp.nombre, rp?.cuentas.length || 0, `${new Date().toLocaleString()} hora de la central.`, 'J2:L8');

    // Encabezado de tabla
    printTableHead(sheet, [ {text: "#", colspan: 1}, {text: "Nombre", colspan: 5}, {text: "Estado", colspan: 1},{text: "Eventos recibidos", colspan: 1}], 'FFFFFFFF','FF000066', 13);
    
    const conditionValue = (value: any) => {
      if (value === StateBatery.WITHOUT) {
        return 'Sin eventos'
      } else if (value === StateBatery.RESTORE) {
        return 'Con restaure'
      }
      return 'Sin restaure'
    }
    const conditionColor = (value: any) => {
      if (value === StateBatery.WITHOUT) {
        return 'FF3acf9e'
      } else if (value === StateBatery.RESTORE) {
        return 'FFdfd32b'
      }
      return 'FFff7782'
    }
    // Data
    rp.cuentas.forEach((account, idx) => {
      styleColum(sheet, 14 + idx, 18, 'FFFFFFFF');
      printData(sheet, account, [{ colspan: 5, key: "nombre" }, { colspan: 1, key: "estado", conditionValue, conditionColor }, { colspan: 1, key: "numeroEventos" }], 14 + idx,2, idx+1)
    })
    return workbook.xlsx.writeBuffer()

  }

  async statePDF(report: ReportDTO, user: User) {
    const data = await this.reportService.reportState(report, user);
    const doc = new jsPDF({
      orientation: 'landscape',
      compress: true
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let positionTable: number = 60;
    // Header el documento
    addHeader(doc, 'ESTADO DE SUCURSALES', 'Reporte generado el:', data.nombre, data?.cuentas.length || 0, pageWidth, `${new Date().toLocaleString()} hora de la central.`)

    if (report.showGraphs) {
      positionTable = 118;
      const close = getPercentaje(data!.cuentas.filter(account => ['CS', 'C'].includes(account.evento?.CodigoAlarma)).length, data.cuentas.length);
      const open = getPercentaje(data!.cuentas.filter(account => ['O', 'OS'].includes(account.evento?.CodigoAlarma)).length, data!.cuentas.length);
      const withOut = getPercentaje(data!.cuentas.filter(account => account.evento ? false : true).length, data!.cuentas.length);
      
      createGraph(doc, [
        { ...open, rgb: { r: 28, g: 207, b: 158 }, textHelph: 'SUCURSALES ABIERTAS' },
        { ...close, rgb: { r: 255, g: 119, b: 130 }, textHelph: 'SUCURSALES CERRADAS' },
        { ...withOut, rgb: { r: 223, g: 211, b: 43 }, textHelph: 'SUCURSALES SIN ESTADO' }
      ]);
    }
    const body: RowInput[] = data?.cuentas.map(account => {
      const color = account.evento
        ? (['O', 'OS'].includes(account.evento.CodigoAlarma))
          ?
          '#3acf9e'
          :
          '#ff7782'
        : '#dfd32b';
      return [
        account.CodigoAbonado,
        account.Nombre,
        account.evento ? account.evento.FechaOriginal + ' ' + account.evento.Hora.substring(0, 5) : '',
        {
          content: account.evento
            ? (['O', 'OS'].includes(account.evento.CodigoAlarma))
              ?
              'Abierto'
              :
              'Cerrado'
            : 'Sin Estado',
          styles: {
            textColor: color,
            fontStyle: 'bold'
          }
        },
        account.evento ? account.evento.NombreUsuario : ''
      ]
    }) || [];

    autoTable(doc, {
      head: [['Abonado', 'Nombre', 'Fecha y hora', 'Estado', 'Usuario']],
      startY: positionTable,
      body,
      theme: 'striped',
      headStyles: {
        fontStyle: 'bold',
        fillColor: '#000066',
        textColor: '#fff',
      }
    })

    addFoother(doc, pageWidth, pageHeight);
    return doc.output('arraybuffer')
  }

  async stateXLSX(report: ReportDTO, user: User){
    const data = await this.reportService.reportState(report, user);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PEMSA";
    const sheet = workbook.addWorksheet(`Estado de ${data.nombre}`);

    // Encabezado del docuemnto
    addHeaderXLS(workbook, sheet, 'ESTADO DE SUCURSALES', 'Reporte generado el:', data.nombre, data?.cuentas.length || 0, `${new Date().toLocaleString()} hora de la central.`, 'L2:N8');

    // Encabezado de tabla
    printTableHead(sheet, [{ text: "Abonado", colspan: 1 }, { text: "Nombre", colspan: 4 }, { text: "Fecha y hora", colspan: 2 }, { text: "Estado", colspan: 1 }, { text: "Usuario", colspan: 2 }], 'FFFFFFFF', 'FF000066', 13)

    const conditionFecha = (value: any) => {
      if( !value ){
        return '';
      }
      return `${value.FechaOriginal} ${ value.Hora.substring(0, 5)}`;
    }
    const conditionState = (value: any) => {
      if(!value){
        return 'Sin estado'
      }
      return ['O', 'OS'].includes(value.CodigoAlarma) ? 'Abierto' : 'Cerrado'
    }
    const conditionColorState = (value: any) => {
      if (!value) {
        return 'FFdfd32b'
      }
      return ['O', 'OS'].includes(value.CodigoAlarma) ? 'FF3acf9e' : 'FFff7782'
    }
    const conditionName = (value: any) => {
      if (!value) {
        return ''
      }
      return value.NombreUsuario
    }
    data.cuentas.forEach( (account, idx) => {
      styleColum(sheet, 14 + idx, 18, 'FFFFFFFF');
      printData(sheet, account, [{ colspan: 1, key: "CodigoAbonado" }, { colspan: 4, key: "Nombre" }, { colspan: 2, key: "evento", conditionValue: conditionFecha }, { colspan: 1, key: 'evento', conditionValue: conditionState, conditionColor: conditionColorState }, { colspan: 2, key: "evento", conditionValue: conditionName }], 14+idx,2, 0)
      
    })

    return workbook.xlsx.writeBuffer()

  }

  async apciWeekPDF(report: ReportDTO, user: User) {
    const data = await this.reportService.reportApCiWeek(report, user);
    const doc = new jsPDF({
      orientation: 'landscape',
      format: 'legal',
      compress: true
    });


    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let positionTable: number = 60;

    addHeader(doc, 'HORARIO DE APERTURAS Y CIERRES', `Reporte generado el:`, data.nombre, data.cuentas.length || 0, pageWidth, `${new Date().toLocaleString()} hora de la central.`);

    if (report.showGraphs) {
      positionTable = 118;
      const openOk = getPercentaje(data.cuentas.reduce((prev, curr) => {
        let algo: number[] = data.fechas.flatMap(date => {
          return curr.eventos?.find(ev => ev.FechaOriginal === date && ['O', 'OS'].includes(ev.CodigoAlarma)) ? 1 : 0;
        })
        let suma = algo.reduce((a, b) => a + b)
        return prev + suma;

      }, 0), data.cuentas.length * 7);
      const openFt = getPercentaje(data.cuentas.length * 7 - data.cuentas.reduce((prev, curr) => {
        let algo: number[] = data.fechas.flatMap(date => {
          return curr.eventos?.find(ev => ev.FechaOriginal === date && ['O', 'OS'].includes(ev.CodigoAlarma)) ? 1 : 0;
        })
        let suma = algo.reduce((a, b) => a + b)
        return prev + suma;

      }, 0), data.cuentas.length * 7);
      const closeOk = getPercentaje(data.cuentas.reduce((prev, curr) => {
        let algo: number[] = data.fechas.flatMap(date => {
          return curr.eventos?.find(ev => ev.FechaOriginal === date && ['C', 'CS'].includes(ev.CodigoAlarma)) ? 1 : 0;
        })
        let suma = algo.reduce((a, b) => a + b)
        return prev + suma;

      }, 0), data.cuentas.length * 7);
      const closeFt = getPercentaje(data.cuentas.length * 7 - data.cuentas.reduce((prev, curr) => {
        let algo: number[] = data.fechas.flatMap(date => {
          return curr.eventos?.find(ev => ev.FechaOriginal === date && ['C', 'CS'].includes(ev.CodigoAlarma)) ? 1 : 0;
        })
        let suma = algo.reduce((a, b) => a + b)
        return prev + suma;

      }, 0), data.cuentas.length * 7);
      createGraphComparative(doc, [
        { ...openOk, rgb: { r: 58, g: 207, b: 158 }, textHelph: 'APERTURAS RECIBIDAS' },
        { ...openFt, rgb: { r: 223, g: 211, b: 43 }, textHelph: 'APERTURAS FALTANTES' },
        { ...closeOk, rgb: { r: 255, g: 119, b: 130 }, textHelph: 'CIERRES RECIBIDOS' },
        { ...closeFt, rgb: { r: 223, g: 211, b: 43 }, textHelph: 'CIERRES FALTANTES' },

      ]);
    }

    const body: RowInput[] = data?.cuentas.map((account, idx) => {
      const dates = data.fechas.flatMap((date) => (
        [
          account.eventos?.find(ev => ev.FechaOriginal === date && ['O', 'OS'].includes(ev.CodigoAlarma))?.Hora.substring(0, 5) || '--:--',
          account.eventos
            ?
            (account.eventos?.filter(ev => ev.FechaOriginal === date).length === 0)
              ?
              '--:--'
              :
              ['C', 'CS'].includes(account.eventos!.filter(ev => ev.FechaOriginal === date)[account.eventos!.filter(ev => ev.FechaOriginal === date).length - 1].CodigoAlarma)
                ?
                account.eventos!.filter(ev => ev.FechaOriginal === date)[account.eventos!.filter(ev => ev.FechaOriginal === date).length - 1].Hora.substring(0, 5)
                :
                '--:--'
            :
            '--:--'
        ]
      ))
      return [
        idx + 1,
        account.Nombre,
        ...dates
      ]
    }) || [];

    autoTable(doc, {
      head: [
        ['', '', ...data!.fechas.map(date => ({ colSpan: 2, content: date }))],
        ['', '', ...data!.fechas.map(date => (
          {
            colSpan: 2, content: new Date(Date.UTC(Number(date.split('-')[0]), Number(date.split('-')[1]) - 1, Number(date.split('-')[2]) + 1)).toLocaleString(undefined, { weekday: 'long' }).toString()
          }
        ))],
        ['#', 'Nombre', 'ap', 'ci', 'ap', 'ci', 'ap', 'ci', 'ap', 'ci', 'ap', 'ci', 'ap', 'ci', 'ap', 'ci']
      ],
      startY: positionTable,
      body,
      theme: 'striped',
      headStyles: {
        fontStyle: 'bold',
        fillColor: '#000066',
        textColor: '#fff',
      }
    })
    addFoother(doc, pageWidth, pageHeight);

    return doc.output('arraybuffer')
  }
  async apciWeekXLSX(report: ReportDTO, user: User){
    const data = await this.reportService.reportApCiWeek(report, user);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PEMSA";
    const sheet = workbook.addWorksheet(`Estado de ${data.nombre}`);
    // Change height for row.
    [13, 14, 15].forEach(row => styleColum(sheet, row, 25, 'FFFFFFFF'));


    // Encabezado del docuemnto
    // Reporte generado el: 
    addHeaderXLS(workbook, sheet, 'HORARIO DE APERTURAS Y CIERRES', `Reporte generado el:`, data.nombre, data?.cuentas.length || 0, `${new Date().toLocaleString() } hora de la central.`, 'P2:S8');

    // Celdas vacias
    printValue(sheet, "", 3, 1, 13, 2, 'FF000066', 'FFFFFFFF');
    data.fechas.forEach( (date,idx) => {
      const day = new Date(Date.UTC(Number(date.split('-')[0]), Number(date.split('-')[1]) - 1, Number(date.split('-')[2]) + 1)).toLocaleString(undefined, { weekday: 'long' }).toString();
      printValue(sheet, date, 1, 0, 13, 6 + idx * 2, 'FF000066', 'FFFFFFFF');
      printValue(sheet, day, 1, 0, 14, 6 + idx * 2, 'FF000066', 'FFFFFFFF');
    })
    // Titulos y APCI
    printValue(sheet, "#", 0, 0, 15, 2, 'FF000066', 'FFFFFFFF');
    printValue(sheet, "Nombre", 2, 0, 15, 3, 'FF000066', 'FFFFFFFF');
    for (let i = 0; i < data.fechas.length; i++) {
      printValue(sheet, "AP", 0, 0, 15, 6 + i * 2, 'FF000066', 'FFFFFFFF');
      printValue(sheet, "CI", 0, 0, 15, 7 + i * 2, 'FF000066', 'FFFFFFFF');
    }
    
    // DATA
    const row = 16;
    data.cuentas.forEach((account,idx) => {
      styleColum(sheet, row + idx, 18, 'FFFFFFFF');
      printValue(sheet, account.Nombre, 2, 0, row + idx, 3, (idx % 2 === 0) ? "FFFFFFFF" : "FFDEE6EF", "FF000000")
      printValue(sheet, idx+1, 0, 0, row + idx, 2, (idx % 2 === 0) ? "FFFFFFFF" : "FFDEE6EF", "FF000000")
      data.fechas.forEach( (date,i) => {
        const value1 = account.eventos?.find(ev => ev.FechaOriginal === date && ['O', 'OS'].includes(ev.CodigoAlarma))?.Hora.substring(0, 5) || '--:--';
        const value2 = account.eventos
          ?
          (account.eventos?.filter(ev => ev.FechaOriginal === date).length === 0)
            ?
            '--:--'
            :
            ['C', 'CS'].includes(account.eventos!.filter(ev => ev.FechaOriginal === date)[account.eventos!.filter(ev => ev.FechaOriginal === date).length - 1].CodigoAlarma)
              ?
              account.eventos!.filter(ev => ev.FechaOriginal === date)[account.eventos!.filter(ev => ev.FechaOriginal === date).length - 1].Hora.substring(0, 5)
              :
              '--:--'
          :
          '--:--';
        printValue(sheet, value1, 0, 0, row + idx, 6 + i * 2, (idx % 2 === 0) ? "FFFFFFFF" : "FFDEE6EF", "FF000000");
        printValue(sheet, value2, 0, 0, row + idx, 7 + i * 2, (idx % 2 === 0) ? "FFFFFFFF" : "FFDEE6EF", "FF000000");
      })
      
    })
    return workbook.xlsx.writeBuffer()
  }

  async apiciPDF(report: ReportDatesDTO, user: User) {
    const data = await this.reportService.reportApCI(report, user)
    const doc = new jsPDF({
      orientation: 'landscape',
      compress: true
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let positionTable: number = 67;
    const name = (data.cuentas.length === 1) ? data.cuentas[0].Nombre : '';

    addHeader(doc, 'APERTURAS Y CIERRES', 'ENTRE LAS FECHAS', name, data?.cuentas.length || 0, pageWidth, `${report.dateStart} A ${report.dateEnd}`, `Reporte generado el: ${new Date().toLocaleString()} hora de la central.`);

    if (report.showGraphs && data.cuentas.length === 1) {
      positionTable = 125;
      const close = getPercentaje(data!.cuentas[0].eventos?.filter(ev => ['C', 'CS'].includes(ev.CodigoAlarma)).length || 0, data?.cuentas[0].eventos?.length || 1);
      const open = getPercentaje(data!.cuentas[0].eventos?.filter(ev => ['O', 'OS'].includes(ev.CodigoAlarma)).length || 0, data?.cuentas[0].eventos?.length || 1);

      createGraph(doc, [
        { ...open, rgb: { r: 58, g: 207, b: 158 }, textHelph: 'APERTURAS' },
        { ...close, rgb: { r: 255, g: 119, b: 130 }, textHelph: 'CIERRES' }
      ], true)
    }

    data?.cuentas.forEach((account, idx) => {
      const header: RowInput[] = [
        [{ content: account.Nombre, colSpan: 7 }],
        [{ content: account.Direccion, colSpan: 7 }],
        ['#', 'Fecha', 'Hora', 'Partición', 'Evento', 'N Usuario', 'Nombre de usuario']
      ];
      const body: RowInput[] = account.eventos?.map((event, idx) => ([
        idx + 1, event.FechaOriginal, event.Hora, event.Particion, event.DescripcionEvent, event.CodigoUsuario, event.NombreUsuario
      ])) || [];

      autoTable(doc, {
        head: header,
        startY: (idx === 0) ? positionTable : false,
        body,
        theme: 'striped',
        headStyles: {
          fontStyle: 'bold',
          fillColor: '#000066',
          textColor: '#fff',
        }
      })
    })

    addFoother(doc, pageWidth, pageHeight);

    return doc.output('arraybuffer')
  }

  async apciXLSX(report: ReportDatesDTO, user: User){
    const data = await this.reportService.reportApCI(report, user)
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PEMSA";


    const sheet = workbook.addWorksheet(`APCI ${data.nombre}`);
    let numberRow = 14;

    //Encabezado del docuemnto
    const name = (data.cuentas.length === 1) ? data.cuentas[0].Nombre : '';
    addHeaderXLS(workbook, sheet, 'APERTURAS Y CIERRES', 'ENTRE LAS FECHAS', name, data?.cuentas.length || 0, `${report.dateStart} A ${report.dateEnd}`, 'J2:L8', `Reporte generado el: ${new Date().toLocaleString()} hora de la central.`);

    data.cuentas.forEach(account => {

      // Encabezado de tabla
      styleColum(sheet, numberRow-2, null, 'FFFFFFFF')
      printValue(sheet, account.Nombre, 11, 0, numberRow - 2, 2, 'FF000066', 'FFFFFFFF');

      printTableHead(sheet, [{ text: "#", colspan: 1 }, { text: "Fecha", colspan: 1 }, { text: "Hora", colspan: 1 }, { text: "Partición", colspan: 1 }, { text: "Evento", colspan: 2 }, { text: "N Usuario", colspan: 1 }, { text: "Nombre", colspan: 3 }], 'FFFFFFFF', 'FF000066', numberRow - 1)

      if (account.eventos) {
        account.eventos.forEach((event, idx) => {
          styleColum(sheet, numberRow + idx, null, 'FFFFFFFF');
          printData(sheet, event, [{ colspan: 1, key: "FechaOriginal" }, { colspan: 1, key: "Hora" }, { colspan: 1, key: "Particion" }, { colspan: 2, key: "DescripcionEvent" }, { colspan: 1, key: "CodigoUsuario" }, { colspan: 3, key: "NombreUsuario" }], numberRow + idx,2, idx + 1)
        })
        numberRow += account.eventos.length;
      } else {
        styleColum(sheet, numberRow, null, 'FFFFFFFF')
        printValue(sheet, "Sin eventos", 11, 0, numberRow, 2, 'FFFFFFFF', 'FF000000');
        numberRow += 1;
      }
      numberRow += 5

    })

    return workbook.xlsx.writeBuffer()
  }

  async alarmPDF(report: ReportDatesDTO, user: User) {
    const data = await this.reportService.reportEventoAlarm(report, user);
    console.log(data.cuentas.length);

    const doc = new jsPDF({
      orientation: 'landscape',
      compress: true
    });
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let positionTable: number = 67;

    const name = (data.cuentas.length === 1) ? data.cuentas[0].Nombre : '';
    addHeader(doc, 'EVENTOS DE ALARMA', 'ENTRE LAS FECHAS', name, data?.cuentas.length || 0, pageWidth, `${report.dateStart} A ${report.dateEnd}`, `Reporte generado el: ${new Date().toLocaleString() } hora de la central.`);


    if (report.showGraphs && data.cuentas.length === 1) {
      positionTable = 125;
      const apci = getPercentaje(data!.cuentas[0].eventos?.filter(ev => ["C", "CS", "O", "OS", "UR11", "US11"].includes(ev.CodigoAlarma)).length || 0, data?.cuentas[0].eventos?.length || 1);
      const alarm = getPercentaje(data!.cuentas[0].eventos?.filter(ev => ["A", "ACZ", "ASA", "ATR", "CPA", "FIRE", "GA", "P", "SAS", "SMOKE", "VE"].includes(ev.CodigoAlarma)).length || 0, data?.cuentas[0].eventos?.length || 1);
      const test = getPercentaje(data!.cuentas[0].eventos?.filter(ev => ["AGT", "AT", "ATP", "AUT", "TST", "TST0", "TST1", "TST3", "TSTR", "TX0"].includes(ev.CodigoAlarma)).length || 0, data?.cuentas[0].eventos?.length || 1);
      const batery = getPercentaje(data!.cuentas[0].eventos?.filter(ev => ['BB', 'RBB'].includes(ev.CodigoAlarma)).length || 0, data?.cuentas[0].eventos?.length || 1);
      const other = getPercentaje(data!.cuentas[0].eventos?.filter(ev => ["1381", "24H", "ACR", "BPS", "CAS", "CN", "CTB", "ET*", "FC*", "FCA", "FT", "FT*", "IA*", "MED", "PA", "PAF", "PR", "PRB", "RAS", "REB", "RES", "RFC", "RON", "S99", "STL", "SUP", "TAM", "TB", "TEL", "TESE", "TESS", "TPL", "TRB"].includes(ev.CodigoAlarma)).length || 0, data?.cuentas[0].eventos?.length || 1);

      createGraph(doc, [
        { ...apci, rgb: { r: 58, g: 207, b: 158 }, textHelph: 'APERTURAS Y CIERRES' },
        { ...alarm, rgb: { r: 255, g: 119, b: 130 }, textHelph: 'ALARMAS' },
        { ...test, rgb: { r: 43, g: 202, b: 223 }, textHelph: 'PRUEBAS' },
        { ...batery, rgb: { r: 223, g: 211, b: 43 }, textHelph: 'BATERÍAS' },
        { ...other, rgb: { r: 151, g: 114, b: 32 }, textHelph: 'OTROS' }
      ], true)
    }

    data?.cuentas.forEach((account, idx) => {
      const header: RowInput[] = [
        [{ content: account.Nombre, colSpan: 8 }],
        [{ content: account.Direccion, colSpan: 8 }],
        ['#', 'Fecha', 'Hora', 'Partición', 'Evento', 'N Usuario', 'Zona', 'Nombre']
      ];
      const body: RowInput[] = account.eventos?.map((event, idx) => ([
        idx + 1, event.FechaOriginal, event.Hora, event.Particion, event.DescripcionEvent, event.CodigoUsuario, event.CodigoZona, event.NombreUsuario + event.DescripcionZona
      ])) || [];

      autoTable(doc, {
        head: header,
        startY: (idx === 0) ? positionTable : false,
        body,
        theme: 'striped',
        headStyles: {
          fontStyle: 'bold',
          fillColor: '#000066',
          textColor: '#fff',
        }
      })
    })

    addFoother(doc, pageWidth, pageHeight);

    return doc.output('arraybuffer')
  }

  async alarmXLSX(report: ReportDatesDTO, user: User){
    const data = await this.reportService.reportEventoAlarm(report, user);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PEMSA";


    const sheet = workbook.addWorksheet(`Alarma ${data.nombre}`);
    let numberRow = 14;
    
    //Encabezado del docuemnto
    const name = (data.cuentas.length === 1) ? data.cuentas[0].Nombre : '';
    addHeaderXLS(workbook, sheet, 'EVENTOS DE ALARMA', 'ENTRE LAS FECHAS', name, data?.cuentas.length || 0, `${report.dateStart} A ${report.dateEnd}`, 'J2:M8', `Reporte generado el: ${new Date().toLocaleString()} hora de la central.`);

    data.cuentas.forEach( account => {
      
      // Encabezado de tabla
      styleColum(sheet, numberRow-2, null, 'FFFFFFFF');
      printValue(sheet, account.Nombre, 12, 0, numberRow - 2, 2, 'FF000066', 'FFFFFFFF');

      printTableHead(sheet, [{ text: "#", colspan: 1 }, { text: "Fecha", colspan: 1 }, { text: "Hora", colspan: 1 }, { text: "Partición", colspan: 1 }, { text: "Evento", colspan: 2 }, { text: "N Usuario", colspan: 1 }, { text: "Zona", colspan: 1 }, { text: "Nombre", colspan: 3 }], 'FFFFFFFF', 'FF000066', numberRow-1)

      if(account.eventos){
        account.eventos.forEach( (event, idx) => {
          styleColum(sheet, numberRow + idx, null, 'FFFFFFFF');
          printData(sheet, event, [{ colspan: 1, key: "FechaOriginal" }, { colspan: 1, key: "Hora" }, { colspan: 1, key: "Particion" }, { colspan: 2, key: "DescripcionEvent" }, { colspan: 1, key: "CodigoUsuario" }, { colspan: 1, key: "CodigoZona" }, { colspan: 3, key:["NombreUsuario", "DescripcionZona"] }], numberRow+idx,2, idx+1)
        })
        numberRow += account.eventos.length;
      }else{
        styleColum(sheet, numberRow, null, 'FFFFFFFF');
        printValue(sheet, "Sin eventos", 12, 0, numberRow, 2, 'FFFFFFFF', 'FF000000');
        numberRow += 1;
      }
      numberRow += 5

    })
    
    return workbook.xlsx.writeBuffer()

  }
}
