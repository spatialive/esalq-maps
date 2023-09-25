import {
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
    BiomesService,
    CountryService,
    Feature,
    fixEncoding,
    Layer,
    LimitsService,
    MunicipalitiesService,
    StatesService,
    Theme
} from '../../../shared';
import {of, Subject, switchMap, takeUntil} from 'rxjs';
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
import {MatToolbarModule} from '@angular/material/toolbar';
import * as XLSX from 'xlsx';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
    selector: 'statistics-dialog',
    templateUrl: './statistics-dialog.component.html',
    exportAs: 'statistics',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        ...statisticsModules,
        MatToolbarModule,
        MatTooltipModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class StatisticsDialogComponent implements OnInit, OnDestroy {
    @ViewChild('paginator') paginator!: MatPaginator;
    @ViewChild(MatSort) matSort!: MatSort;
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
        private readonly countryService: CountryService,
        private readonly biomesService: BiomesService,
        private readonly statesService: StatesService,
        private readonly municipalitiesService: MunicipalitiesService,
        private readonly translocoService: TranslocoService,
        private readonly _http: HttpClient,
        private fuseLoadingService: FuseLoadingService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.themes = [];
        this.states = [];
        this.dados = [];
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
                        case 'teeb:camada_estados':
                            return this.statesService.states$;
                        case 'teeb:camada_br':
                            return this.countryService.country$;
                        case 'teeb:camada_biomas':
                            return this.biomesService.biomes$;
                        case 'teeb:camada_municipios':
                            return this.municipalitiesService.municipalities$;
                        default:
                            return of([]);
                    }
                })
            )
            .subscribe({
                next: (data) => {
                    this.dados = data.map((feat) => {
                        feat.properties['TITULO'] = fixEncoding(feat.properties['TITULO']);
                        return feat;
                    });
                    this.fillTable();
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
        this.themesSeleted.valueChanges.subscribe({
            next: () => {
                this.fillTable();
            }
        });
        this.statesSeleted.valueChanges.subscribe({
            next: (value) => {
                this.filterData(value.map(item => item.properties['SIGLA_UF']));
            }
        });
        this.getThemes();
    }
    exportToXLS(): void {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
        const at: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.themes);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'dados');
        XLSX.utils.book_append_sheet(wb, at, 'metadados');
        XLSX.writeFile(wb, `${this.currentLimit.Name}_dados.xlsx`);
    }
    exportToJSON(): void {
        const dataStr = JSON.stringify(this.dataSource.data);
        const blob = new Blob([dataStr], { type: 'text/json;charset=utf-8;' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.setAttribute('download', `${this.currentLimit.Name}_dados.json`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    exportToCSV(): void {
        const csvData = this.convertToCSV(this.dataSource.data);
        const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
        let dwldLink = document.createElement('a');
        const url = URL.createObjectURL(blob);
        // eslint-disable-next-line eqeqeq
        const isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;

        // if Safari open in new window to save file with random filename.
        if (isSafariBrowser) {
            dwldLink.setAttribute('target', '_blank');
        }
        dwldLink.setAttribute('href', url);
        dwldLink.setAttribute('download', `${this.currentLimit.Name}_dados.csv`);
        dwldLink.style.visibility = 'hidden';
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }

    convertToCSV(objArray: any[]): string {
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
    }

    fillTable(): void {
        this.fuseLoadingService.show();
        this.themesTable = [...this.themesFixed, ...this.themesSeleted.value];
        this.displayedColumns = [...this.themesFixed.map(item => item.id), ...this.themesSeleted.value.map(theme => theme.id)];
        this.dataSource = new MatTableDataSource<any>(this.dados.map(mun => mun.properties));
        if(this.currentLimit.Name.includes('municipios')){
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            this.dataSource.filterPredicate = (data: any, filter: string) => {
                const filterArray: string[] = JSON.parse(filter);
                const dataValue = data['SIGLA_UF'] ? data['SIGLA_UF'].toString().toLowerCase() : '';
                return filterArray.some(filterItem => dataValue.includes(filterItem.toLowerCase()));
            };
        }

        setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.matSort;
            this.fuseLoadingService.hide();
        }, 100);
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
    }
}
