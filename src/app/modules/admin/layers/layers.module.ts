import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import {Route, RouterModule } from '@angular/router';
import {LayersComponent} from './layers.component';
import {OlMapsModule} from '../../../shared/map/ol-maps.module';
import {TranslocoModule} from '@ngneat/transloco';
import {FuseCardModule} from '../../../../@fuse/components/card';
import {FuseDrawerModule} from '../../../../@fuse/components/drawer';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {UploaderModule} from '../../../core/uploader/uploader.module';
import {MatDialogModule} from '@angular/material/dialog';
import {FuseAlertModule} from '../../../../@fuse/components/alert';
import {NgApexchartsModule} from 'ng-apexcharts';
import {MatButtonToggleModule} from "@angular/material/button-toggle";

const datasetRoutes: Route[] = [
    {
        path     : '',
        component: LayersComponent,
    },
];

@NgModule({
    declarations: [
        LayersComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(datasetRoutes),
        OlMapsModule,
        TranslocoModule,
        FuseCardModule,
        FuseDrawerModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatButtonModule,
        UploaderModule,
        MatDialogModule,
        FuseAlertModule,
        NgApexchartsModule,
        MatButtonToggleModule
    ],
    exports: [
        LayersComponent
    ]
})

export class LayersModule {}