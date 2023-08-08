import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import TileLayer from 'ol/layer/Tile';
import {XYZ} from 'ol/source';
import {Subject, takeUntil} from 'rxjs';
import {LayersService} from './layers.service';
import {MatDialog} from '@angular/material/dialog';
import {Collection} from './layers.types';
import {WmsService} from "../../../shared/wms/wms.service";

@Component({
    selector: 'layers',
    templateUrl: './layers.component.html',
    styleUrls: ['./layers.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class LayersComponent implements OnInit {
    public layers: any[] = [];
    public collections: Collection[] = [];
    protected mapWidth: number = 200;
    protected mapHeight: number = 500;
    private unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private layersService: LayersService,
        public dialog: MatDialog,
        private readonly wmsService: WmsService
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

    ngOnInit(): void {
        this.loadCollections();
        this.mapWidth = window.innerWidth - 320;
        this.mapHeight = window.innerHeight - 320;
        this.wmsService.get().subscribe({
            next: (value) => {
                const parse = this.wmsService.parseWMSCapabilities(value);
                console.log(parse);
            }
        });
    }

    loadCollections(): void {
    }
}
