import {Component, OnInit, Input} from '@angular/core';
import {OlMapComponent} from '../map/ol-map.component';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Point from 'ol/geom/Point';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import * as Proj from 'ol/proj';
import {Feature} from 'ol';
import {Feature as DatasetFeature} from '../../../modules/admin/layers/layers.types';

@Component({
    selector: 'ol-map-features',
    templateUrl: './ol-map-features.component.html',
    styleUrls: ['./ol-map-features.component.scss']
})
export class OlMapFeaturesComponent implements OnInit {
    @Input() features: DatasetFeature[];

    constructor(private olMap: OlMapComponent) {
    }

    ngOnInit(): void {
        const styles = [
            new Style({
                stroke: new Stroke({
                    color: 'blue',
                    width: 3,
                }),
                fill: new Fill({
                    color: 'rgba(0, 0, 255, 0.1)',
                }),
            }),
            new Style({
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({
                        color: '#2196f3',
                    }),
                }),
            }),
        ];
        const features: Feature[] = this.features.map(feature => new Feature({
            geometry: new Point(Proj.fromLonLat([feature.lon, feature.lat])),
            properties: feature
        }));
        const vectorSource = new VectorSource({
            features: features
        });
        const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: styles
        });

        vectorLayer.setZIndex(10);

        if (this.olMap.map) {
            this.olMap.setFeatures(vectorLayer);
        } else {
            setTimeout(() => {
                this.ngOnInit();
            }, 10);
        }
    }
}
