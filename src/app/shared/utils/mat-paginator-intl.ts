import { MatPaginatorIntl } from '@angular/material/paginator';
import {Injectable} from '@angular/core';
@Injectable()
export class MatPaginatorIntlPtBr extends MatPaginatorIntl {
    itemsPerPageLabel = 'Itens por página';
    nextPageLabel     = 'Próxima página';
    previousPageLabel = 'Página anterior';

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
            return `0 de ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} de ${length}`;
    };
}
