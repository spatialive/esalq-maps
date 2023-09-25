import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedModule } from 'app/shared/shared.module';
import { LimitsComponent } from './limits.component';

@NgModule({
    declarations: [
        LimitsComponent
    ],
    imports     : [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        SharedModule
    ],
    exports     : [
        LimitsComponent
    ]
})
export class LimitsModule {}
