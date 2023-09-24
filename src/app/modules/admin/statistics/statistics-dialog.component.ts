import {
    Component, CUSTOM_ELEMENTS_SCHEMA, Inject, NO_ERRORS_SCHEMA,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {LimitsService, Layer, LayersService} from '../../../shared';
import {Subject, takeUntil} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {statisticsModules} from './statistics-modules';
@Component({
    selector       : 'statistics-dialog',
    templateUrl    : './statistics-dialog.component.html',
    exportAs       : 'limits',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports: statisticsModules,
    schemas: [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class StatisticsDialogComponent implements OnInit, OnDestroy {
    currentLimit: Layer;
    themes: Layer[];
    themesSeleted = new FormControl('');
    private unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private readonly limitsService: LimitsService,
        private readonly layersService: LayersService,
        public dialogRef: MatDialogRef<StatisticsDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.themes = [];
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.limitsService.limits$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    this.currentLimit = layers.find(l => l.visible);
                }
            });
        this.layersService.layers$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                   console.log('StatisticsDialogComponent', layers.filter(lay => lay.visible && !lay.Name.includes('teeb:camada')));
                   this.themes = layers;
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.Name || index;
    }
    close(): void {
        this.dialogRef.close();
    }
}
