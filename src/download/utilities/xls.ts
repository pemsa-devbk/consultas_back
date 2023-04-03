import * as ExcelJS from 'exceljs';
import { existsSync } from 'fs';
import { join } from 'path';

interface HeadTable {
    text: string;
    colspan: number
}

interface Cell<T> {
    colspan: number;
    key: keyof T | (keyof T)[];
    conditionValue?: (value: T[keyof T]) => string | number;
    color?: string;
    conditionColor?: (value: T[keyof T]) => string;
}


export const addHeaderXLS = (book: ExcelJS.Workbook, sheet: ExcelJS.Worksheet, title: string, dateTitle: string, name: string, numberAccounts: number, date: string, positionImage: string, extraData?: string) => {

    // Para el titulo del documento
    sheet.getRow(2).height = 22;
    const titleReport = sheet.getCell('B2');
    titleReport.value = `REPORTE DE ${title} ${name ? `DE ${name}` : ''}`;
    titleReport.font = { size: 14, name: 'Calibri' };
    sheet.getColumn('B').width = 5;
    sheet.mergeCells('B2:I2');

    // Subtitulos y permisos
    const fontSubtitles = { size: 9, name: 'Calibri' };
    const sub1 = sheet.getCell('C4');
    sub1.value = "PROTECCIÓN ELECTRÓNICA MONTERREY S.A. DE C.V.";
    sub1.font = fontSubtitles;
    if(extraData){
        const sub2 = sheet.getCell('C5');
        sub2.value =extraData;
        sub2.font = fontSubtitles;
    }
    const sub2 = sheet.getCell(extraData ? 'C6': 'C5');
    sub2.value = `${dateTitle} ${date}`
    sub2.font = fontSubtitles;
    const sub3 = sheet.getCell(extraData ? 'C7' :'C6');
    sub3.value = `NÚMERO DE CUENTAS: ${numberAccounts}`
    sub3.font = fontSubtitles;

    const sub4 = sheet.getCell( extraData ? 'C9' :'C8');
    sub4.value = "PERMISO SSP FEDERAL: DGSP/303-16/3302"
    sub4.font = fontSubtitles;
    const sub5 = sheet.getCell( extraData ?'C10' :'C9');
    sub5.value = "PERMISO SSP EDO. DE PUEBLA: SSP/SUBCOP/DGSP/114-15/109"
    sub5.font = fontSubtitles;
    for (let i = 4; i <= 10; i++) {
        sheet.mergeCells(`C${i}:I${i}`)
    }

    const pathLogo = join(__dirname, '../../assets/PEMSA.png');
    if (existsSync(pathLogo)) {
        const image = book.addImage({
            filename: pathLogo,
            extension: 'png'
        });
        sheet.addImage(image, positionImage );
    }
    for (let i = 1; i <= 12; i++) {
        const row =sheet.getRow(i);
        row.getCell(1).value = "";
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
    }

}

export const printData = <T>(sheet: ExcelJS.Worksheet, data: T, colspans: Cell<T>[], lastRow: number, colSelect: number, index?: number) => {
    const row = sheet.getRow(lastRow)
    if(index){
        row.getCell(colSelect).value = index;
        colSelect += 1;
    }
    colspans.forEach(col => {
        const cell = row.getCell(colSelect);
        if (Array.isArray(col.key)){
            const text = col.key.map( ky => {
                return data[ky];
            }).join(' ')
            cell.value = text;
        }else{
            //@ts-ignore
            cell.value = col.conditionValue ? col.conditionValue(data[col.key]) : data[col.key];
        }
        if (col.color || col.conditionColor) {
            if(Array.isArray(col.key)){
                cell.font = { color: { argb: col.color || col.conditionColor(data[col.key[0]]) } }
            }else{
                // @ts-ignore
                cell.font = { color: { argb: col.color || col.conditionColor(data[col.key]) } }
            }
        }
        if (col.colspan > 1) {
            sheet.mergeCells(lastRow, colSelect, lastRow, colSelect + col.colspan)
            colSelect += 1;
        }
        colSelect = colSelect + col.colspan;
    })
}

export const printTableHead = (sheet: ExcelJS.Worksheet, texts: HeadTable[], fontColor: string, bgColor: string, lastRow: number) => {
    const row = sheet.getRow(lastRow)
    row.height = 25;
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
    let colSelect: number = 2;
    texts.forEach(head => {
        const cell = row.getCell(colSelect);
        cell.value = head.text;
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
        cell.alignment = { vertical: 'middle' };
        cell.font = { color: { argb: fontColor } };

        if (head.colspan > 1) {
            sheet.mergeCells(lastRow, colSelect, lastRow, colSelect + head.colspan)
            colSelect += 1;
        } else {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            sheet.getColumn(colSelect).width = columnLength + 4;
        }
        colSelect = colSelect + head.colspan;

    })
}

export const printValue = (sheet: ExcelJS.Worksheet, value: string | number, colSpan: number, rowSpan: number, row: number, colum: number, bgColor: string, fontColor: string) => {
    const rowSelected = sheet.getRow(row);
    const cell = rowSelected.getCell(colum);
    cell.value = value;
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    cell.alignment = { vertical: 'middle' };
    cell.font = { color: { argb: fontColor } };

    sheet.mergeCells(row, colum, row+rowSpan, colum + colSpan);
}

export const styleColum = (sheet: ExcelJS.Worksheet, row: number, height?: number, bg?: string) => {
    const rowSelected = sheet.getRow(row);
    if( height ) rowSelected.height = height;
    if (bg ) rowSelected.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
}