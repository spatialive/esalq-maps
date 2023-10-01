import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Pipe({
    name: 'safeNumber'
})
export class SafeNumberPipe implements PipeTransform {

    constructor(private decimalPipe: DecimalPipe) {}

    transform(value: any, ...args: any[]): any {
        if (this.isNumeric(value)) {
            return this.decimalPipe.transform(value, ...args);
        }
        return value;
    }

    private isNumeric(value: any): boolean {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
}
