import {
    Component,
    OnInit,
    AfterViewInit,
    Input,
    ElementRef,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    HostListener, OnChanges, SimpleChanges, OnDestroy
} from '@angular/core';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import {defaults as defaultInteractions} from 'ol/interaction';
import proj4 from 'proj4';
import * as Proj from 'ol/proj';
import {register} from 'ol/proj/proj4';
import {get as getProjection, Projection} from 'ol/proj';
import {FuseLoadingService} from '../../../../@fuse/services/loading';
import {MapEvent} from 'ol';

export const DEFAULT_WIDTH = '100%';
export const DEFAULT_HEIGHT = '500px';

export const DEFAULT_LAT = -34.603490361131385;
export const DEFAULT_LON = -58.382037891217465;

@Component({
    selector: 'ol-map',
    templateUrl: './ol-map.component.html',
    styleUrls: ['./ol-map.component.scss']
})
export class OlMapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

    @Input() lat: number = DEFAULT_LAT;
    @Input() lon: number = DEFAULT_LON;
    @Input() loading: boolean = false;
    @Input() zoom: number;
    @Output() ready = new EventEmitter<Map>();
    @Output() clickPoint: EventEmitter<MapEvent> = new EventEmitter<MapEvent>();
    public target: string = '';
    public _width: number | string;
    public _height: number | string;
    map: Map;
    private mapEl: HTMLElement;
    private projection: Projection;
    private readonly extent: Array<number> = [-100.546875,-46.073231,-4.570313,17.644022];

    constructor(
        private elementRef: ElementRef,
        private cdRef: ChangeDetectorRef,
        private fuseLoadingService: FuseLoadingService
    ) {}

    @Input() set width(value: number) {
        if (value) {
            this._width = value;
            this.setSize();
        } else {
            this._width = DEFAULT_WIDTH;
        }
        this.updateMapSize();
    };

    @Input() set height(value: number) {
        if (value) {
            this._height = value;
            this.setSize();
        } else {
            this._height = DEFAULT_HEIGHT;
        }
        this.updateMapSize();
    };

    @HostListener('window:resize', ['$event'])
    onWindowResize(): void {
        this.map.updateSize();
    }

    ngOnInit(): void {
        this.target = 'map-' + Math.random().toString(36).substring(2);
    }

    ngAfterViewInit(): void {
        const self = this;
        this.mapEl = this.elementRef.nativeElement.querySelector('#' + this.target);
        this.setSize();

        proj4.defs('EPSG:4674', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs');
        register(proj4);

        const wordExtent: Array<number> = [-180, -90, 180, 90];

        getProjection('EPSG:4674').setExtent(this.extent);
        getProjection('EPSG:4674').setWorldExtent(wordExtent);

        this.projection = new Projection({
            code: 'EPSG:4674',
            units: 'm',
            extent: this.extent,
            worldExtent: wordExtent
        });
        const view: View = new View({
            center: Proj.fromLonLat([this.lon, this.lat]),
            zoom: this.zoom,
            minZoom: 4.8,
            maxZoom: 19,
            // extent: this.extent,
            // projection: this.projection
        });
        this.map = new Map({
            target: this.target,
            interactions: defaultInteractions({altShiftDragRotate: false, pinchRotate: false}),
            view: view
        });
        this.map.on('loadstart', () => {
            self.fuseLoadingService.show();
        });
        this.map.on('loadend', () => {
            self.fuseLoadingService.hide();
        });
        this.map.on('singleclick', async (evt: MapEvent) => this.clickPoint.emit(evt));

        setTimeout(() => {
            this.ready.emit(this.map);
        });
        this.cdRef.detectChanges();
    }
    updateMapSize(): void {
        this.map?.updateSize();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.map){
            // let combinedExtent = null;
            // this.map.getLayers().forEach((layer) => {
            //     const layerExtent = layer.getExtent();
            //     if (layerExtent) {
            //         if (combinedExtent) {
            //             combinedExtent = extend(combinedExtent, layerExtent);
            //         } else {
            //             combinedExtent = layerExtent;
            //         }
            //     }
            // });
            //
            // if (combinedExtent) {
            //     this.map.getView().fit(combinedExtent, {
            //         size: this.map.getSize(),
            //         padding: [10, 10, 10, 10],
            //     });
            // }
        }
    }

    setSize(): void {
        if (this.mapEl) {
            const styles = this.mapEl.style;
            styles.height = this.coerceCssPixelValue(this._height) || DEFAULT_HEIGHT;
            styles.width = this.coerceCssPixelValue(this._width) || DEFAULT_WIDTH;
        }
    }

    public addLayer(layer): void {
        this.map.addLayer(layer);
        this.cdRef.detectChanges();
    }

    setMarker(vector): void {
        this.map.addLayer(vector);
        this.cdRef.detectChanges();
    }

    setFeatures(vector): void {
        this.map.addLayer(vector);
        const extent = vector.getSource().getExtent();
        this.map.getView().fit(extent);
        this.cdRef.detectChanges();
    }

    public setControl(control: any): void {
        this.map.addControl(control);
    }

    coerceCssPixelValue(value: any): string {
        const cssUnitsPattern = /([A-Za-z%]+)$/;
        if (value == null) {
            return '';
        }
        return cssUnitsPattern.test(value) ? value : `${value}px`;
    }
    moveToTop(map: Map, layer): void {
        console.log(map, layer);
        map.removeLayer(layer);
        map.addLayer(layer);
    }
    ngOnDestroy(): void {
    }
}

