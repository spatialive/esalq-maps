import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { DatasetsComponent } from 'app/modules/admin/datasets/datasets.component';
import {OlMapsModule} from '../../../shared/map/ol-maps.module';
import {TranslocoModule} from '@ngneat/transloco';
import {FuseCardModule} from '../../../../@fuse/components/card';
import {FuseDrawerModule} from '../../../../@fuse/components/drawer';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {DatasetItemComponent} from './dataset-item/dataset-item.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {UploaderModule} from '../../../core/uploader/uploader.module';
import {UploadDatasetDialogComponent} from './upload-dataset-dialog/upload-dataset-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {FuseAlertModule} from '../../../../@fuse/components/alert';
const datasetRoutes: Route[] = [
    {
        path     : '',
        component: DatasetsComponent,
    }
];

@NgModule({
    declarations: [
        DatasetsComponent,
        DatasetItemComponent,
        UploadDatasetDialogComponent
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
        FuseAlertModule
    ],
    exports: [
        DatasetItemComponent,
        UploadDatasetDialogComponent
    ]
})
export class DatasetsModule
{
}
