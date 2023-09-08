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
import * as Proj from 'ol/proj';
import {FuseLoadingService} from '../../../../@fuse/services/loading';

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
    public target: string = '';
    public _width: number | string;
    public _height: number | string;
    map: Map;
    private mapEl: HTMLElement;

    constructor(private elementRef: ElementRef, private cdRef: ChangeDetectorRef, private fuseLoadingService: FuseLoadingService) {

    }

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
        this.map = new Map({
            target: this.target,
            interactions: defaultInteractions({altShiftDragRotate: false, pinchRotate: false}),
            view: new View({
                center: Proj.fromLonLat([this.lon, this.lat]),
                zoom: this.zoom
            })
        });
        this.map.on('loadstart', () => {
            self.fuseLoadingService.show();
        });
        this.map.on('loadend', () => {
            self.fuseLoadingService.hide();
        });
        this.cdRef.detectChanges();
        setTimeout(() => {
            this.ready.emit(this.map);
        });
    }
    updateMapSize(): void {
        this.map?.updateSize();
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
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
    ngOnDestroy(): void {
    }
}

