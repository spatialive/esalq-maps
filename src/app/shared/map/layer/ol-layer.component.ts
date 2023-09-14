import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {OlMapComponent} from '../map/ol-map.component';
import {setHighestZIndex} from "../../utils";

@Component({
    selector: 'ol-layer',
    templateUrl: './ol-layer.component.html',
    styleUrls: ['./ol-layer.component.scss']
})
export class OlLayerComponent implements OnInit {
    @Input() layer: any = {};

    constructor(private olMap: OlMapComponent, private cdRef: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        if (this.olMap.map) {
            const self = this;
            let hasLayer = false;
            this.olMap.map.getLayers().forEach((layer) => {
                if (layer.get('name') === this.layer.get('name')) {
                    hasLayer = true;
                }
                layer.on('change:visible', (event) => {
                    //
                });
            });
            if (hasLayer) {
                // Do nothing
            } else {
                this.olMap.addLayer(this.layer);
                setTimeout(() => {
                    setHighestZIndex(this.olMap.map, this.layer);
                }, 200);
            }
        } else {
            setTimeout(() => {
                this.ngOnInit();
            }, 10);
        }
        this.cdRef.detectChanges();
    }
}
