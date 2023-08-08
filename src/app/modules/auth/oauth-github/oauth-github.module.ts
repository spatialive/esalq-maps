import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FuseCardModule } from '@fuse/components/card';
import { FuseAlertModule } from '@fuse/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { OauthGithubComponent } from 'app/modules/auth/oauth-github/oauth-github.component';
import { oAuthGithubRoutes } from 'app/modules/auth/oauth-github/oauth-github.routing';

@NgModule({
    declarations: [
        OauthGithubComponent
    ],
    imports     : [
        RouterModule.forChild(oAuthGithubRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FuseCardModule,
        FuseAlertModule,
        SharedModule
    ]
})
export class OauthGithubModule
{
}
