import {
    ChangeDetectorRef,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Inject,
    NO_ERRORS_SCHEMA,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {LimitsService, Layer, LayersService, Theme, Feature, StatesService, fixEncoding} from '../../../shared';
import {Subject, takeUntil} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {statisticsModules} from './statistics-modules';
import {Translation, TranslocoService} from '@ngneat/transloco';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
@Component({
    selector       : 'statistics-dialog',
    templateUrl    : './statistics-dialog.component.html',
    exportAs       : 'statistics',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports: [
        ...statisticsModules
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class StatisticsDialogComponent implements OnInit, OnDestroy {
    currentLimit: Layer;
    themes: Theme[] = [];
    states: Feature[] = [];
    themesSeleted = new FormControl('');
    statesSeleted = new FormControl('');
    private unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        public dialogRef: MatDialogRef<StatisticsDialogComponent>,
        private readonly limitsService: LimitsService,
        private readonly statesService: StatesService,
        private readonly translocoService: TranslocoService,
        private readonly _http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.themes = [];
        this.states = [];
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
        this.translocoService.langChanges$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
            next: (lang) => {
                this.getThemes(lang);
            }
        });
        this.statesService.states$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (states) => {
                   this.states = states.map((feat) => {
                       feat.properties['TITULO'] = fixEncoding(feat.properties['TITULO']);
                       return feat;
                   });
                   this.states.sort((a, b) => a.properties.TITULO.localeCompare(b.properties.TITULO));

                }
            });
        this.getThemes();
    }
    getThemes(lang: string = 'pt'): void {
        this._http.get<Translation>(`${environment.langUrl}/assets/i18n/${lang}.json`)
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (translation) => {
                    this.themes = Object.entries(translation['variaveis_camadas_vetoriais'])
                        .map((item): Theme => ({ id: item[0], label: item[1]['label'], description: item[1]['descricao']}));

                    this.themes.sort((a, b) => a.label.localeCompare(b.label));
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
    trackByFn(index: number, item: any): any {
        return item.Name || index;
    }
    close(): void {
        this.dialogRef.close();
    }
}
