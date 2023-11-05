import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    Inject,
    NO_ERRORS_SCHEMA,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    exportToCSV,
    exportToJSON,
    exportToXLS,
    Feature,
    GlobalDataService,
    Layer,
    LimitsService,
    Theme,
    WfsService
} from '../../../shared';
import {of, Subject, switchMap, take, takeUntil} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormControl} from '@angular/forms';
import {statisticsModules} from './statistics-modules';
import {Translation, TranslocoService} from '@ngneat/transloco';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {FuseLoadingService} from '../../../../@fuse/services/loading';

@Component({
    selector: 'statistics-dialog',
    templateUrl: './statistics-dialog.component.html',
    exportAs: 'statistics',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        ...statisticsModules
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class StatisticsDialogComponent implements OnInit, AfterViewInit, OnDestroy {
    // @ViewChild('paginator') paginator!: MatPaginator;
    @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
    @ViewChild(MatSort, { static: true }) matSort!: MatSort;
    currentLimit: Layer;
    themes: Theme[] = [];
    themesTable: Theme[] = [];
    states: Feature[] = [];
    dados: Feature[] = [];
    themesSeleted = new FormControl([]);
    themesFixed: Theme[] = [
        {
            id: 'CODIGO',
            label: 'Código'
        },
        {
            id: 'TITULO',
            label: 'Nome'
        },
        {
            id: 'SIGLA_UF',
            label: 'Sigla / UF'
        }
    ];
    statesSeleted = new FormControl([]);
    displayedColumns: string[] = [];
    dataSource!: MatTableDataSource<any>;
    private unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        public dialogRef: MatDialogRef<StatisticsDialogComponent>,
        private readonly limitsService: LimitsService,
        private readonly wfsService: WfsService,
        readonly globalDataService: GlobalDataService,
        private readonly translocoService: TranslocoService,
        private readonly _http: HttpClient,
        private fuseLoadingService: FuseLoadingService,
        private changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.themes = [];
        this.states = [];
        this.dados = [];
        this.dataSource = new MatTableDataSource<any>();
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
        this.limitsService.limits$
            .pipe(
                takeUntil(this.unsubscribeAll),
                switchMap((layers) => {
                    this.currentLimit = layers.find(l => l.visible);
                    switch (this.currentLimit.Name) {
                        case this.globalDataService.mapLayerNames$.estados:
                            return this.wfsService.states$;
                        case this.globalDataService.mapLayerNames$.brasil:
                            return this.wfsService.country$;
                        case this.globalDataService.mapLayerNames$.biomas:
                            return this.wfsService.biomes$;
                        case this.globalDataService.mapLayerNames$.municipios:
                            return this.wfsService.municipalities$;
                        case this.globalDataService.mapLayerNames$.frentesDesmatamento:
                            return this.wfsService.frentesDesmatamento$;
                        default:
                            return of([]);
                    }
                }),
                take(1)
            )
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (dados) => {
                    this.dados = dados;

                    console.log(this.dados);

                    // this.dataSource.data = this.dados.map(mun => mun.properties);
                    // this.fillTable();
                }
            });
        this.translocoService.langChanges$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (lang) => {
                    this.getThemes(lang);
                }
            });
        this.wfsService.states$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (states) => {
                    this.states = states;
                    this.states.sort((a, b) => a.properties.TITULO.localeCompare(b.properties.TITULO));

                }
            });
        this.themesSeleted.valueChanges
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: () => {
                    this.fillTable();
                }
            });
        this.statesSeleted.valueChanges
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (value) => {
                    this.filterData(value.map(item => item.properties['SIGLA_UF']));
                }
            });
        this.getThemes();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;

        this.dataSource.data = this.dados.map(mun => mun.properties);
        this.fillTable();
        // The important part:
        this.changeDetectorRef.detectChanges();

    }

    exportToXLS(): void {
        exportToXLS(this.dataSource, this.themes, this.currentLimit.Name);
    }
    exportToJSON(): void {
        exportToJSON(this.dataSource, this.currentLimit.Name);
    }

    exportToCSV(): void {
        exportToCSV(this.dataSource, this.currentLimit.Name);
    }
    fillTable(): void {
        this.fuseLoadingService.show();
        this.themesTable = [...this.themesFixed, ...this.themesSeleted.value];
        this.displayedColumns = [...this.themesFixed.map(item => item.id), ...this.themesSeleted.value.map(theme => theme.id)];

        if(this.currentLimit.Name.includes('municipios')){
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            this.dataSource.filterPredicate = (data: any, filter: string) => {
                const filterArray: string[] = JSON.parse(filter);
                const dataValue = data['SIGLA_UF'] ? data['SIGLA_UF'].toString().toLowerCase() : '';
                return filterArray.some(filterItem => dataValue.includes(filterItem.toLowerCase()));
            };
        } else if(this.currentLimit.Name.includes('bioma')){
            this.displayedColumns = this.displayedColumns.filter(column => !column.includes('SIGLA_UF'));
        }

        setTimeout(() => {
            // this.dataSource.paginator = this.paginator;
            // this.dataSource.sort = this.matSort;
            this.fuseLoadingService.hide();

        }, 100);
    }

    private logLoadTime(startTime: number, endTime: number): void {
        const loadTime = startTime - endTime;
        console.log(`Load time: ${loadTime.toFixed(2)} ms`);
    }

    filterData(value: string[]): void {
        if(Array.isArray(value) && value.length > 0){
            this.dataSource.filter = JSON.stringify(value);
        } else {
            this.dataSource.filter = '';
        }
    }

    onChange($event: any): void {
        const filteredData =  this.dados.map(mun => mun.properties).filter(item => item.SIGLA_UF.toLowerCase() ===  $event.value.toLowerCase());
        this.dataSource = new MatTableDataSource(filteredData);
    }

    getThemes(lang: string = 'pt'): void {
        this.fuseLoadingService.show();
        this._http.get<Translation>(`${environment.langUrl}/assets/i18n/${lang}.json`)
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (translation) => {
                    this.themes = Object.entries(translation['variaveis_camadas_vetoriais'])
                        .map((item): Theme => ({
                            id: item[0],
                            label: item[1]['label'],
                            description: item[1]['descricao']
                        }));
                    this.themes.sort((a, b) => a.label.localeCompare(b.label));
                    this.fuseLoadingService.hide();
                }, error: () => this.fuseLoadingService.hide()
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
        this.ngOnDestroy();
    }
}
