import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Tile as TileLayer} from 'ol/layer';
import {TileWMS, XYZ} from 'ol/source';
import {Subject, take, takeUntil} from 'rxjs';
import {
    exportToCSV,
    exportToJSON,
    exportToXLS,
    Feature,
    fixEncoding,
    GlobalDataService,
    Layer,
    LayersService,
    LimitsService,
    MunicipalitiesService,
    normalize,
    setHighestZIndex,
    Theme,
    WfsService
} from '../../../shared';
import Map from 'ol/Map';
import {environment} from '../../../../environments/environment';
import {Translation, TranslocoService} from '@ngneat/transloco';
import {FuseMediaWatcherService} from '../../../../@fuse/services/media-watcher';
import {transform} from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import {SearchMunicipalityState} from '../../../shared/states/search-municipality.state';
import {Feature as OlFeature} from 'ol';
import {MatTableDataSource} from '@angular/material/table';
import {FuseLoadingService} from '../../../../@fuse/services/loading';
import {HttpClient} from '@angular/common/http';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {flattenLayers} from '../../../shared/utils/layer.util';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import BaseLayer from "ol/layer/Base";
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics.service";

@Component({
    selector: 'layers',
    templateUrl: './layers.component.html',
    styleUrls: ['./layers.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LayersComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('containerMap') containerMap: ElementRef;
    @ViewChild('paginator') paginator!: MatPaginator;
    @ViewChild(MatSort) matSort!: MatSort;

    public layers: any[] = [];
    public legends: Layer[] = [];
    public map: Map;
    public displayFeatureInfo: any = {};
    public extentOptions: any;
    public currentLimit: Layer;
    public featureLayer: VectorLayer<VectorSource>;
    public overlay: Overlay;
    public feature: OlFeature;
    public displayedColumns: string[] = ['label', 'value'];
    public dataSource!: MatTableDataSource<any>;
    protected mapWidth: number;
    protected mapHeight: number;
    private unsubscribeAll: Subject<any> = new Subject<any>();
    private activeLimit: any;
    private activeLayers: any[] = [];
    private mapperLimits: any;
    private themes: any[];


    /**
     * Constructor
     */
    constructor(
        private readonly cdr: ChangeDetectorRef,
        private readonly layersService: LayersService,
        private readonly limitsService: LimitsService,
        private readonly municipalitiesService: MunicipalitiesService,
        private readonly searchMunicipalityState: SearchMunicipalityState,
        private readonly wfsService: WfsService,
        private readonly globalDataService: GlobalDataService,
        private readonly _http: HttpClient,
        private readonly translocoService: TranslocoService,
        private readonly fuseMediaWatcherService: FuseMediaWatcherService,
        private readonly fuseLoadingService: FuseLoadingService,
        private readonly googleAnalyticsService: GoogleAnalyticsService,

    ) {
        this.layers = [];
    }
    @HostListener('window:resize', ['$event'])
    setDimensions(): void {
        const containerMapDimensions = this.containerMap?.nativeElement.getBoundingClientRect();
        if(!containerMapDimensions){
            return;
        }
        this.mapWidth = containerMapDimensions.width < 300 ? 300 : containerMapDimensions.width - 20;
        this.mapHeight = containerMapDimensions.height - 70;
        this.cdr.detectChanges();
    }
    ngOnInit(): void {
        this.layers.unshift(new TileLayer({
            properties: {
                key: 'mapbox-light',
                type: 'bmap',
                visible: false,
            },
            source: new XYZ({
                attributions: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
                url:
                // eslint-disable-next-line max-len
                    'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=sk.eyJ1IjoiZ3BwZXNhbHEiLCJhIjoiY2xudWR6ZmwwMGNiZzJ4cXR2eXU4aDY4cSJ9.tH_uMA7TgjbRUsRMYBrc_A',
            }),
            visible: true
        }));
        this.extentOptions = {
            tipLabel: this.translocoService.translate('extent_lable'),
            extent: [-80.455078,-30.496675,6.226563,50.966176]
        };

        this.mapperLimits = {
            municipios: [],
            estados: [],
            biomas: [],
            br: []
        };
        this.getThemes();
    }
    subscriptions(): void{
        this.limitsService.limits$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    this.currentLimit = layers.find(l => l.visible);
                    this.googleAnalyticsService.eventEmitter('visualizar-layer', 'Limite', this.currentLimit.Title);
                }
            });
        this.layersService.layers$
            .pipe(take(1))
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                   this.limitsService.get(layers);
                   const lays = layers.filter(lay => !lay.Name.includes('teeb:camada_'));
                   const limits = layers.filter(lay => lay.Name.includes('teeb:camada_'));
                    this.addLayers(flattenLayers(lays));
                    this.addLimits(limits);
                }
            });
        this.layersService.layers$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    layers = layers.filter(lay => !lay.Name.includes('teeb:camada_'));
                    this.handleLayers(flattenLayers(layers));
                }
            });
        this.limitsService.limits$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    this.handleLayers(flattenLayers(layers));
                }
            });
        this.wfsService.country$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (country: Feature[]) => {
                    this.mapperLimits.br = country;
                }
            });
        this.wfsService.biomes$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (biomes: Feature[]) => {
                    this.mapperLimits.biomas = biomes;
                }
            });
        this.wfsService.states$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (states: Feature[]) => {
                    this.mapperLimits.estados = states;
                }
            });
        this.wfsService.municipalities$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (municipalities: Feature[]) => {
                    this.mapperLimits.municipios = municipalities.map((feat) => {
                        feat.properties['TITULO'] = fixEncoding( feat.properties['TITULO']);
                        return feat;
                    });
                }
            });

        this.translocoService.langChanges$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (values) => {
                    this.extentOptions.tipLabel = this.translocoService.translate('extent_lable');
                }
            });
       this.fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: ({matchingAliases}) => {
                    // Check if the screen is small
                    // this.isScreenSmall = !matchingAliases.includes('md');
                }
            });
        this.searchMunicipalityState.codigo$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (codigo) => {
                    if(codigo !== 'remove'){
                        this.municipalitiesService.getMunicipioByCodigo(codigo).subscribe({
                            next: (featureJson) => {
                                if(featureJson){
                                    this.addFeatureToMap(featureJson, true);
                                }
                            }
                        });
                    } else {
                        if(codigo) {
                            this.removeFeatureFromMap();
                        }
                    }
                }
            });
        this.layersService.layers$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    const newLegends = [];
                    flattenLayers(layers).forEach((lay) => {
                        if (lay.visible && !lay.Name.includes('teeb:camada')) {
                            newLegends.push(lay);
                        }
                    });

                    this.legends = newLegends;
                    this.cdr.detectChanges();
                }
            });
    }
    handleLayers(layers: Layer[]): void {
        this.fuseLoadingService.show();
        if(Array.isArray(layers)){
            if (this.map) {
                layers.forEach((lay: Layer) => {
                    this.update(lay.Name, lay.visible);
                });
            }
        }
        this.fuseLoadingService.hide();
    }
    addFeatureToMap(feature: Feature, fromSearch: boolean = false): void{
        if(this.featureLayer){
            this.removeFeatureFromMap();
            this.dataSource.data = [];
            this.hidePopup();
        }
        this.feature = this.jsonToFeature(feature);
        this.featureLayer.getSource().addFeature(this.feature);
        const extent = this.feature.getGeometry().getExtent();
        this.map.getView().fit(extent, { duration: 500 });
        if(fromSearch){
            this.limitsService.updateLimitVisibility(this.globalDataService.mapLayerNames$.municipios, true);
        }
    }
    removeFeatureFromMap(): void {
        this.featureLayer.getSource().removeFeature(this.feature);
        this.map.getView().setZoom(2.8);
    }
    addLayers(layers: Layer[]): void {
        if (Array.isArray(layers)) {
            layers.forEach((lay: Layer) => {
                const tileLayer: TileLayer<TileWMS> = new TileLayer({
                    visible: lay.visible,
                    source: new TileWMS({
                        url: `${environment.geoserverUrl}/geoserver/wms`,
                        params: {
                            tiled: true,
                            layers: lay.Name
                        },
                        serverType: 'geoserver',
                    }),
                    properties: {
                        name: lay.Name,
                        title: lay.Title,
                        type: 'raster',
                    },
                });
                this.layers.push(tileLayer);
            });
        }
    }
    addLimits(limits: Layer[]): void {
        if (Array.isArray(limits)) {
            limits.forEach((lay) => {
                const tileLayer: TileLayer<TileWMS> = new TileLayer({
                    visible: lay.visible,
                    source: new TileWMS({
                        url: `${environment.geoserverUrl}/geoserver/wms`,
                        params: {
                            tiled: true,
                            layers: lay.Name
                        },
                        serverType: 'geoserver',
                    }),
                    properties: {
                        name: lay.Name,
                        title: lay.Title,
                        type: 'vector',
                    },
                });
                this.layers.push(tileLayer);
            });
        }
    }

    update(name: string, visible: boolean): void {
        const layer = this.map.getLayers().getArray().find(baseLayer => baseLayer.get('name') === name);
        if (layer) {
            layer.setVisible(visible);
            if(visible){
                setHighestZIndex(this.map, layer);
            }
        }
    }
    ngAfterViewInit(): void {
        this.setDimensions();
        setTimeout(() => {
            this.layersService.updateLayerVisibility(environment.defaultLayer, true);
        }, 1000);
        this.dataSource = new MatTableDataSource<any>([]);
        this.cdr.detectChanges();
    }
    onMapReady(map: Map): void {
        this.map = map;
        this.limitsService.limits$
            .pipe(take(1))
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    setTimeout(() => {
                        this.handleLayers(layers);
                    }, 1000);
                }
            });
        this.featureLayer = new VectorLayer({
            source: new VectorSource(),
            map: this.map,
            style: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'stroke-color': 'rgba(255, 255, 255, 0.7)', 'stroke-width': 2,
            },
        });
        this.overlay = new Overlay({
            element: document.getElementById('overlay'),
            positioning: 'top-right',
            stopEvent: true,
            offset: [0, -10]
        });
        this.map.addOverlay(this.overlay);
        this.subscriptions();
    }
    showPopup(evt, feature): void{
        this.addFeatureToMap(feature);
        this.createInfoTable();
        const coordinates = evt.coordinate;
        this.overlay.setPosition(coordinates);
        this.googleAnalyticsService.eventEmitter('click-map', 'point', this.currentLimit.Title, coordinates.toString());

    }
    toXLS(): void {
        exportToXLS(this.dataSource, null, normalize(this.displayFeatureInfo?.TITULO, true));
        this.googleAnalyticsService.eventEmitter('click-map-export', 'xls', this.displayFeatureInfo?.TITULO);

    }
    toJSON(): void {
        exportToJSON(this.dataSource, normalize(this.displayFeatureInfo?.TITULO, true));
        this.googleAnalyticsService.eventEmitter('click-map-export', 'json', this.displayFeatureInfo?.TITULO);

    }

    toCSV(): void {
        exportToCSV(this.dataSource, normalize(this.displayFeatureInfo?.TITULO, true));
        this.googleAnalyticsService.eventEmitter('click-map-export', 'csv', this.displayFeatureInfo?.TITULO);

    }
    createInfoTable(): void {
        const info = {...this.displayFeatureInfo};
        delete info['TITULO'];
        delete info['coordinate'];
        const dados: any [] = Object.entries(info).map((item) => {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const theme = this.themes.find(theme => theme.id === item[0]);
            return {
                label: theme['label'],
                value: item[1],
                description: theme['description']
            };
        });
        this.dataSource.data = dados;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;
        this.cdr.detectChanges();
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
    hidePopup(): void {
        this.overlay.setPosition(undefined);
        this.removeFeatureFromMap();
    }
    handlePoint(evt): void{

        const point = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4674');
        this.updateActiveLayers();

        this.displayFeatureInfo = {coordinate: point};

        const foundKey = Object.keys(this.mapperLimits).find(key => key.includes(this.activeLimit.Name.split('teeb:camada_')[1]));

        if(this.activeLimit.Name.includes('camada_br')){
            const properties = this.mapperLimits[foundKey][0].properties;
            this.displayFeatureInfo = Object.assign(this.displayFeatureInfo, this.findMatchingProperties(this.activeLayers.flatMap(layer => layer.KeywordList), properties));
            this.wfsService.getFeatureBrasil().subscribe({
                next: (feature) => {
                    this.showPopup(evt, feature);
                }
            });
        } else {
            this.wfsService.getPointInfo(this.activeLimit.Name, point).subscribe({
                next: (feature) => {
                    if (feature) {
                        const matchedMapperLimit = this.mapperLimits[foundKey].find(limit => limit.id === feature.id);
                        const properties = matchedMapperLimit.properties;
                        this.displayFeatureInfo = Object.assign(
                            this.displayFeatureInfo,
                            this.findMatchingProperties(this.activeLayers.flatMap(layer => layer.KeywordList), properties));
                        this.showPopup(evt, feature);
                    } else {
                        this.hidePopup();
                        console.log('No feature intersected at the point');
                    }
                },
                error: (error) => {
                    console.error('An error occurred:', error);
                }
            });
        }

    }

    findMatchingProperties(keywordLists: any[], propertyObject: any): any {
        const result = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'TITULO': propertyObject.SIGLA_UF ? `${propertyObject.TITULO} - ${propertyObject.SIGLA_UF}` : propertyObject.TITULO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'AREA_KM2': propertyObject.AREA_KM2 ? propertyObject.AREA_KM2 : null,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'AREA_HA': propertyObject.AREA_HA ? propertyObject.AREA_HA : null
        };
        if (!result['AREA_KM2']){
            result['AREA_KM2'] = propertyObject.AREA_HA * 0.01;
        }
        keywordLists.forEach((keyword) => {
            if (propertyObject.hasOwnProperty(keyword)) {
                // Add the matching property name and its value to the result object.
                result[keyword] = propertyObject[keyword];
            }
        });
        return result;
    }

    updateActiveLayers(): void{
        this.limitsService.limits$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    this.activeLimit = layers.find(l => l.visible);
                }
            });
        this.layersService.layers$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    this.activeLayers = layers.filter(l => l.visible && !l.Name.includes('teeb:camada'));
                }
            });
    }
    jsonToFeature(geojsonFeature: Feature): OlFeature {
        const format = new GeoJSON();
        return format.readFeature(geojsonFeature, {
            dataProjection: 'EPSG:4674',
            featureProjection: 'EPSG:3857'
        });
    }

    trackByFn(index: number, item: Layer): any
    {
        return item.Name || index;
    }
    adjustZIndex(): void {
        const first = this.map.getLayers().getArray().map(layer => layer.getZIndex()).filter(item => !isNaN(item));
        const max = Math.max(...first);
        const total = this.legends.length;
        this.legends.forEach((lay: Layer, index: number) => {
            const layer: BaseLayer = this.map.getLayers().getArray().find(l => l.get('name') === lay.Name);
            if (layer) {
                layer.setZIndex(total - Number(index) + max);
            }
        });
    }
    drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.legends, event.previousIndex, event.currentIndex);
        this.adjustZIndex();
    }
    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }
}
