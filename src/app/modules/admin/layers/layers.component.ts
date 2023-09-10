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
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {XYZ, TileWMS} from 'ol/source';
import {Subject, take, takeUntil} from 'rxjs';
import {
    BiomesService,
    LayersService,
    LimitsService,
    MunicipalitiesService,
    StatesService
} from '../../../shared/services';
import {CountryService} from '../../../shared/services';
import Map from 'ol/Map';
import {Layer} from '../../../shared/interfaces';
import {environment} from '../../../../environments/environment';
import {WfsService} from '../../../shared/wfs/wfs.service';
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
    private lays: Layer[] = [];
    private limits: Layer[] = [];
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
    ) {
        this.extentOptions = {
            extent: [-12273952.2539,-4285365.5538,176110.9132,269058.3396]
        };
        this.layers = [
            new TileLayer({
                properties: {
                    key: 'mapbox',
                    type: 'bmap',
                    visible: true,
                },
                source: new XYZ({
                    wrapX: false,
                    attributions: '© <a href=\'https://www.mapbox.com/about/maps/\'>Mapbox</a>',
                    url: 'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=' +
                        'pk.eyJ1IjoidGhhcmxlc2FuZHJhZGUiLCJhIjoiY2thaHAxcDM5MGx2dzJ4dDExaGQ0bGF3ciJ9.kiB2OzG3Q0THur8XLUW3Gg'
                }),
                visible: true
            })
        ];
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
       // setTimeout(this.setDimensions, 900);
        // this.capabilitiesState.getState().subscribe({next: value => console.log("CAP - ", value),
        //     error: err => {console.log(err)}
        // })

        this.wfsService.getEstados().subscribe({next: value => console.log('Estados - ', value),
            error: err => console.log(err)
        });

        this.wfsService.getMunicipios().subscribe({next: value => console.log('Municipios - ', value),
            error: err => console.log(err)
        });

        this.wfsService.getBiomas().subscribe({next: value => console.log('Biomas - ', value),
            error: err => console.log(err)
        });

        this.wfsService.getBrasil().subscribe({next: value => console.log('Brasil - ', value),
            error: err => console.log(err)
        });
    }
    subscriptions(): void{
        this.layersService.layers$
            .pipe(take(1))
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                   this.limitsService.get(layers);
                   layers = layers.filter(lay => !lay.Name.includes('teeb:camada_'));
                   const limits = layers.filter(lay => lay.Name.includes('teeb:camada_'));
                   this.lays = layers;
                   this.limits = limits;
                }
            });
        this.layersService.layers$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (layers) => {
                    this.handleLayers(layers);
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
                            version: '1.1.1',
                            tiled: true,
                            layers: lay.Name
                        }
                    }),
                    properties: {
                        title: lay.Name,
                        key: 'layer',
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
                            version: '1.1.1',
                            tiled: true,
                            layers: lay.Name
                        }
                    }),
                    properties: {
                        title: lay.Name,
                        key: 'limit',
                        type: 'vector',
                    },
                });
                this.layers.push(tileLayer);
            });
        }
    }

    update(name: string, visible: boolean = false): void {
        const layer = this.map.getLayers().getArray().find(baseLayer => baseLayer.get('title') === name);
        if (layer) {
            console.log(visible);
            layer.setVisible(visible);
        }
    }
    ngAfterViewInit(): void {
        this.setDimensions();
        this.subscriptions();
    }
    onMapReady(map: Map): void {
        this.map = map;
        this.addLayers(this.lays);
        this.addLimits(this.limits);
    }
    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }
}
