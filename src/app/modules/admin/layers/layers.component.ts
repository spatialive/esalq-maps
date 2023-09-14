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
        private readonly translocoService: TranslocoService
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
        // console.log(containerMapDimensions, this.mapWidth, this.mapHeight);
        this.cdr.detectChanges();
    }
    ngOnInit(): void {
       // // setTimeout(this.setDimensions, 900);
       //  this.layers.unshift(new TileLayer({
       //      properties: {
       //          name: 'mapbox',
       //          type: 'bmap',
       //          visible: true,
       //      },
       //      source: new XYZ({
       //          wrapX: false,
       //          attributions: '© <a href=\'https://www.mapbox.com/about/maps/\'>Mapbox</a>',
       //          url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=' +
       //              'pk.eyJ1IjoidGhhcmxlc2FuZHJhZGUiLCJhIjoiY2thaHAxcDM5MGx2dzJ4dDExaGQ0bGF3ciJ9.kiB2OzG3Q0THur8XLUW3Gg'
       //      }),
       //      visible: true
       //  }));
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
    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }
}
