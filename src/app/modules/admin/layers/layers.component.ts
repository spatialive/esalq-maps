import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener, OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Tile as TileLayer} from 'ol/layer';
import {XYZ, TileWMS} from 'ol/source';
import {Subject, take, takeUntil} from 'rxjs';
import {
    Layer,
    BiomesService,
    CountryService,
    LayersService,
    LimitsService,
    MunicipalitiesService,
    StatesService,
    WfsService, setHighestZIndex
} from '../../../shared';
import Map from 'ol/Map';
import {environment} from '../../../../environments/environment';
import {TranslocoService} from "@ngneat/transloco";
import {FuseMediaWatcherService} from "../../../../@fuse/services/media-watcher";

@Component({
    selector: 'layers',
    templateUrl: './layers.component.html',
    styleUrls: ['./layers.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LayersComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('containerMap') containerMap: ElementRef;

    public layers: any[] = [];
    public map: Map;
    public extentOptions: any;

    protected mapWidth: number;
    protected mapHeight: number;
    private unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private readonly cdr: ChangeDetectorRef,
        private readonly layersService: LayersService,
        private readonly limitsService: LimitsService,
        private readonly countryService: CountryService,
        private readonly biomesService: BiomesService,
        private readonly statesService: StatesService,
        private readonly municipalitiesService: MunicipalitiesService,
        private readonly wfsService: WfsService,
        private readonly translocoService: TranslocoService,
        private readonly fuseMediaWatcherService: FuseMediaWatcherService,
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
                key: 'google',
                type: 'bmap',
                visible: false,
            },
            source: new XYZ({
                attributions: 'Google Satellite',
                url:
                    'https://mt{0-3}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            }),
            visible: true
        }));
        this.extentOptions = {
            tipLabel: this.translocoService.translate('extent_lable'),
            extent: [-80.455078,-30.496675,6.226563,50.966176]
        };
    }
    subscriptions(): void{
        this.layersService.layers$
            .pipe(take(1))
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                   this.limitsService.get(layers);
                   const lays = layers.filter(lay => !lay.Name.includes('teeb:camada_'));
                   const limits = layers.filter(lay => lay.Name.includes('teeb:camada_'));
                    this.addLayers(lays);
                    this.addLimits(limits);
                }
            });
        this.layersService.layers$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    layers = layers.filter(lay => !lay.Name.includes('teeb:camada_'));
                    this.handleLayers(layers);
                }
            });
        this.limitsService.limits$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    this.handleLayers(layers);
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
    }
    handleLayers(layers: Layer[]): void {
        if(Array.isArray(layers)){
            if (this.map) {
                layers.forEach((lay: Layer) => {
                    this.update(lay.Name, lay.visible);
                });
            }
        }
    }
    addLayers(layers: Layer[]): void {
        if (Array.isArray(layers)) {
            layers.forEach((lay) => {
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
        this.subscriptions();
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
    }
    handlePoint(evt): void{
        console.log(evt);
    }

    // async onDisplayFeatureInfo(pixel: Pixel, evt: MapEvent) {
    //     if (this.lastSelected != null && this.lastSelected !== this.selecao.nativeElement) {
    //         // Não apresenta as informações se houver uma ferramenta ativa que não seja a específica de seleção.
    //         return;
    //     }
    //
    //     if (this.lastInfo != null) {
    //         this.map.removeOverlay(this.lastInfo);
    //         this.lastInfo = null;
    //     }
    //
    //     const tipoCoordenada = this.tipoCoordenadas.value;
    //     const features = new Array<Feature>();
    //     const text: Element[] = new Array<Element>();
    //
    //     const sources: TileWMS[] = this.map.getLayers().getArray().filter(layer => layer.getSource() instanceof TileWMS);
    //     for (const layer of sources) {
    //         if (!layer.getVisible()) {
    //             continue;
    //         }
    //
    //         const div = document.createElement('div');
    //         div.innerHTML = 'Carregando...';
    //         text.push(div);
    //
    //         const url = layer.getSource().getFeatureInfoUrl(
    //             evt.coordinate,
    //             this.map.getView().getResolution(),
    //             'EPSG:4674',
    //             {
    //                 INFO_FORMAT: 'application/json'
    //             }
    //         )
    //
    //         this.httpClient.get<Camada[]>(`${this.env.URL_GEOPORTAL_BASE_REFERENCIA}/api/camadas/featureInfo`, {
    //             responseType: 'json',
    //             params: {
    //                 url: url
    //             }
    //         }).subscribe((ret: any) => {
    //             div.innerHTML = '';
    //             ret.forEach(item => {
    //                 const properties = item.properties;
    //                 Object.keys(properties).forEach((property: string) => {
    //                     if (property !== 'geometry') {
    //                         let valor = properties[property];
    //                         if (valor instanceof Date) {
    //                             valor = [valor.getDate(), valor.getMonth() + 1, valor.getFullYear()].map(n => n < 10 ? `0${n}` : `${n}`).join('/');
    //                         }
    //                         div.innerHTML += `<p><strong>${property.replace(/_/g, ' ')}:</strong> ${tentaResolverProblemaEncoding(valor) || ''}</p>`;
    //                     }
    //                 });
    //             });
    //         }, error => {
    //             if (error.status === 0) {
    //                 this.snackBarService.showError('Sistema de informações de ponto indisponível')
    //             } else {
    //                 this.snackBarService.showError(error.error || error.message)
    //                 div.innerHTML = '';
    //             }
    //         });
    //     }
    //
    //     const geometrias: GeometriaMapa[] = this.getGeometriaCamadas();
    //
    //     this.map.forEachFeatureAtPixel(pixel, feature => features.push(feature));
    //
    //     for (const feature of features) {
    //         // Não apresentar as informações se for a régua.
    //         if (!feature.regua) {
    //             const geometria = geometrias.find(g => g.feature === feature);
    //             const properties = {...(geometria && geometria.propriedades), ...feature.getProperties() || feature.properties};
    //
    //             if (properties) {
    //                 if (feature.id_) {
    //                     properties.id = feature.id_;
    //                 }
    //
    //                 Object.keys(properties).forEach((property: string) => {
    //                     if (property !== 'geometry') {
    //                         let valor = properties[property];
    //                         if (valor) {
    //                             if (valor instanceof Date) {
    //                                 valor = [valor.getDate(), valor.getMonth() + 1, valor.getFullYear()].map(n => n < 10 ? `0${n}` : `${n}`).join('/');
    //                             }
    //                             const div = document.createElement('div');
    //                             div.innerHTML = `<p><strong>${property.replace(/_/g, ' ')}:</strong> ${valor || ''}</p>`;
    //                             text.push(div);
    //                         }
    //                     }
    //                 });
    //             }
    //
    //             let coordinate: Coordinate;
    //             const geometry: Polygon = feature.getGeometry() || feature.geometry;
    //             if (geometry instanceof Polygon || geometry instanceof MultiPolygon) {
    //                 if (text.length !== 0) {
    //                     text.push(document.createElement('hr'));
    //                 }
    //
    //                 const div = document.createElement('div');
    //                 const area = await this.areaGeometriaService.getArea(geometry).toPromise()
    //
    //                 div.innerHTML = `<p><strong>Área: </strong> ${area}</p>`;
    //
    //                 text.push(div);
    //
    //                 coordinate = geometry.getInteriorPoint().getCoordinates();
    //             } else if (geometry instanceof Point) {
    //                 coordinate = toLonLat(geometry.getCoordinates(), this.map.getView().getProjection());
    //             } else {
    //                 coordinate = toLonLat(evt.coordinate, this.map.getView().getProjection());
    //             }
    //
    //             if (coordinate != null) {
    //                 let valor: string;
    //                 if (tipoCoordenada === '1') {
    //                     const formatado: string[] = this.formataCoordenada(coordinate).split(', ');
    //
    //                     if (text.length > 0) {
    //                         text.push(document.createElement('hr'));
    //                     }
    //                     valor = `<p><strong>Latitude:</strong> ${formatado[1]}</p>
    //                             <p class="latitude"><strong>Longitude:</strong> ${formatado[0]}</p>`;
    //                 } else {
    //                     valor = `<p class="latitude" ><strong>Coordenadas:</strong> ${toStringHDMS(coordinate, 4)}</p>`;
    //                 }
    //
    //                 const div = document.createElement('div');
    //                 div.innerHTML = valor;
    //                 text.push(div);
    //             }
    //             if (geometria && ((geometria.extraOptions && geometria.extraOptions.length) || ((geometria.permissao && geometria.permissao.editar)))) {
    //                 const div = document.createElement('div');
    //                 div.style.marginTop = '10px';
    //                 div.style.textAlign = 'right';
    //                 div.style.whiteSpace = 'nowrap';
    //
    //                 if (geometria.extraOptions) {
    //                     geometria.extraOptions.forEach(option => {
    //                         const span = document.createElement('span');
    //                         span.className = 'mat-button-wrapper';
    //
    //                         if (option.icon) {
    //                             const icon = document.createElement('mat-icon');
    //                             icon.className = 'mat-icon notranslate material-icons mat-icon-no-color';
    //                             icon.setAttribute('role', 'img');
    //                             icon.innerText = option.icon;
    //                             span.appendChild(icon);
    //                         }
    //
    //                         span.appendChild(document.createTextNode(' ' + option.text));
    //                         const button = document.createElement('button');
    //                         button.style.marginLeft = '10px';
    //                         if (option.callback) {
    //                             button.addEventListener('click', (_) => {
    //                                 option.callback(geometria);
    //                             });
    //                         }
    //                         button.appendChild(span);
    //                         button.className = 'mat-raised-button mat-secondary';
    //                         div.appendChild(button);
    //
    //                         text.push(div);
    //                     });
    //                 }
    //
    //                 if (geometria.permissao && geometria.permissao.editar) {
    //                     const button = document.createElement('button');
    //                     button.addEventListener('click', (_) => {
    //                         this.showProgressBar = true;
    //                         this.editFeature.emit(geometria);
    //                         this.showProgressBar = false;
    //                     });
    //
    //                     const span = document.createElement('span');
    //                     span.className = 'mat-button-wrapper';
    //
    //                     const icon = document.createElement('mat-icon');
    //                     icon.className = 'mat-icon notranslate material-icons mat-icon-no-color';
    //                     icon.setAttribute('role', 'img');
    //                     icon.innerText = 'edit';
    //                     span.appendChild(icon);
    //
    //                     span.appendChild(document.createTextNode(' Editar atributos'));
    //                     button.style.marginLeft = '10px';
    //                     button.appendChild(span);
    //                     button.className = 'mat-raised-button mat-primary';
    //
    //                     div.appendChild(button);
    //                     text.push(div);
    //                 }
    //             }
    //         }
    //     }
    //
    //     if (features.length === 0) {
    //         const coordinate = toLonLat(evt.coordinate, this.map.getView().getProjection());
    //         let valor: string;
    //         if (this.tipoCoordenadas.value === '1') {
    //             const formatado: string[] = this.formataCoordenada(coordinate).split(', ');
    //
    //             if (text.length > 0) {
    //                 text.push(document.createElement('hr'));
    //             }
    //             valor = `<p><strong>Latitude:</strong> ${formatado[1]}</p>
    //                      <p class="latitude"><strong>Longitude:</strong> ${formatado[0]}</p>`;
    //         } else {
    //             valor = `<p class="latitude"><strong>Coordenadas:</strong> ${toStringHDMS(coordinate, 4)}</p>`;
    //         }
    //         const div = document.createElement('div');
    //         div.innerHTML = valor;
    //
    //         text.push(div);
    //     }
    //
    //     if (text.length !== 0) {
    //         const closer = document.createElement('span');
    //         closer.className = 'ol-popup-closer';
    //
    //         const toolTip = document.createElement('div');
    //         toolTip.className = 'ol-popup ol-popup-info';
    //         toolTip.appendChild(closer);
    //         text.forEach(e => toolTip.appendChild(e));
    //
    //         // Não adiciona o offset da popup se não houver uma feature.
    //         const offset = features.length === 0 ? 0 : -15;
    //         this.lastInfo = new Overlay({
    //             element: toolTip,
    //             offset: [0, offset],
    //             positioning: 'bottom-center',
    //         });
    //
    //         this.lastInfo.setPosition(evt.coordinate);
    //         this.addOverlay(this.lastInfo);
    //
    //         closer.addEventListener('click', () => {
    //             if (this.lastInfo != null) {
    //                 this.map.removeOverlay(this.lastInfo);
    //                 this.lastInfo = null;
    //             }
    //         });
    //     }
    // }
    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }
}
