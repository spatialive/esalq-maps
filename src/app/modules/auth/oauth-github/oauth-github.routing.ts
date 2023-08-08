import { Route } from '@angular/router';
import {OauthGithubComponent} from 'app/modules/auth/oauth-github/oauth-github.component';

export const oAuthGithubRoutes: Route[] = [
    {
        path     : '',
        component: OauthGithubComponent
    }
];
