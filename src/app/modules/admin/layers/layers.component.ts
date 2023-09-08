import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import TileLayer from 'ol/layer/Tile';
import {XYZ} from 'ol/source';
import {Subject} from 'rxjs';
import {LayersService} from './layers.service';
import {MatDialog} from '@angular/material/dialog';
import {Collection} from './layers.types';
import {WmsService} from '../../../shared/wms/wms.service';
import {ActivatedRoute} from '@angular/router';
import {CapabilitiesState} from '../../../shared/state/capabilities.state';

@Component({
    selector: 'layers',
    templateUrl: './layers.component.html',
    styleUrls: ['./layers.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LayersComponent implements OnInit, AfterViewInit {
    @ViewChild('containerMap') containerMap: ElementRef;

    public layers: any[] = [];
    public collections: Collection[] = [];

    protected mapWidth: number;
    protected mapHeight: number;
    private unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private readonly cdr: ChangeDetectorRef,
        private readonly layersService: LayersService,
        public readonly dialog: MatDialog,
        private readonly wmsService: WmsService,
        private readonly route: ActivatedRoute,
        private readonly capabilitiesState: CapabilitiesState
    ) {
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
        const containerMapDimensions = this.containerMap.nativeElement.getBoundingClientRect();
        this.mapWidth = containerMapDimensions.width < 300 ? 300 : containerMapDimensions.width - 20;
        this.mapHeight = containerMapDimensions.height - 70;
        this.cdr.detectChanges();
    }
    ngOnInit(): void {
        const capabilities = this.route.snapshot.data['capabilities'];
        console.log(capabilities);
        this.capabilitiesState.setState(capabilities);
    }
    ngAfterViewInit(): void {
        this.setDimensions();
    }
}
