import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {OlMapComponent} from '../map/ol-map.component';

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
                    console.log(event);
                    if (layer.getVisible()) {
                        self.setHighestZIndex(self.olMap.map, layer);
                    }
                });
            });
            if (hasLayer) {
                // Do nothing
            } else {
                this.olMap.addLayer(this.layer);
                setTimeout(() => {
                    this.setHighestZIndex(this.olMap.map, this.layer);
                }, 200);
            }
        } else {
            setTimeout(() => {
                this.ngOnInit();
            }, 10);
        }
        this.cdRef.detectChanges();
    }

    setHighestZIndex(map, layer): void {
        const layers = map.getLayers().getArray();
        const maxZIndex = Math.max(...layers.map(l => l.getZIndex() || 0));
        layer.setZIndex(maxZIndex + 1);
    }
}
