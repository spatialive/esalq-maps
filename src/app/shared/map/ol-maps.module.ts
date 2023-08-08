import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {OlMapComponent} from './map/ol-map.component';
import {OlLayerComponent} from './layer/ol-layer.component';
import {OlMapMarkerComponent} from './map-marker/ol-map-marker.component';
import {OlControlComponent} from './control/ol-control.component';
import {OlMapFeaturesComponent} from './map-features/ol-map-features.component';

export const COMPONENTS = [
    OlMapComponent,
    OlLayerComponent,
    OlMapMarkerComponent,
    OlControlComponent,
    OlMapFeaturesComponent
];

@NgModule({
    declarations: COMPONENTS,
    exports: COMPONENTS,
    providers: COMPONENTS,
    imports: [
        CommonModule
    ]
})
export class OlMapsModule {
}
