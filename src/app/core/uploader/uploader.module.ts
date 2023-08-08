import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploaderComponent } from './uploader.component';
import { HttpClientModule } from '@angular/common/http';
import {FuseCardModule} from '../../../@fuse/components/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FuseAlertModule} from '../../../@fuse/components/alert';
import {MatChipsModule} from '@angular/material/chips';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        FuseCardModule,
        MatIconModule,
        MatButtonModule,
        FuseAlertModule,
        MatChipsModule,
    ],
  declarations: [UploaderComponent],
  exports: [UploaderComponent]
})
export class UploaderModule { }
