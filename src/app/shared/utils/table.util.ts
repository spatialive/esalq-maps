import * as XLSX from 'xlsx';

export const exportToXLS = (dataSource, themes: any = null, filename: string): void => {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataSource.data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'dados');
    if(themes){
        const at: XLSX.WorkSheet = XLSX.utils.json_to_sheet(themes);
        XLSX.utils.book_append_sheet(wb, at, 'metadados');
    }
    XLSX.writeFile(wb, `${filename}_dados.xlsx`);
};
export const exportToJSON = (dataSource, filename: string): void => {
    const dataStr = JSON.stringify(dataSource.data);
    const blob = new Blob([dataStr], { type: 'text/json;charset=utf-8;' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.setAttribute('download', `${filename}_dados.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};
export const exportToCSV = (dataSource, filename: string): void => {
    const csvData = convertToCSV(dataSource.data);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    // eslint-disable-next-line eqeqeq
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;

    // if Safari open in new window to save file with random filename.
    if (isSafariBrowser) {
        link.setAttribute('target', '_blank');
    }
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_dados.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const convertToCSV = (objArray: any[]): string => {
    const array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < array.length; i++) {
        let line = '';
        // eslint-disable-next-line guard-for-in
        for (const index in array[i]) {
            if (line !== '') {line += ',';}

            line += array[i][index];
        }
        str += line + '\r\n';
    }
    return str;
};

