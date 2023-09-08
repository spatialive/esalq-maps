import {Route} from '@angular/router';
import {LayoutComponent} from 'app/layout/layout.component';
import {InitialDataResolver} from 'app/app.resolvers';
import {Error500Component} from "./shared/error/error-500/error-500.component";
import {Error404Component} from "./shared/error/error-404/error-404.component";
// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
    {
        path: '',
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver
        },
        children: [
            {
                path: '',
                redirectTo: 'layers',
                pathMatch: 'full'
            },
            {
                path: 'layers',
                loadChildren: () => import('app/modules/admin/layers/layers.module').then(m => m.LayersModule)
            },
            {
                path: 'error',
                component: Error500Component
            },
            {
                path: '**',
                component: Error404Component
            }
        ]
    }
];
