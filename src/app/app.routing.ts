import {Route} from '@angular/router';
import {AuthGuard} from 'app/core/auth/guards/auth.guard';
import {NoAuthGuard} from 'app/core/auth/guards/noAuth.guard';
import {LayoutComponent} from 'app/layout/layout.component';
import {InitialDataResolver} from 'app/app.resolvers';
import {LayersResolver} from 'app/modules/admin/layers/layers.resolver';
// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/datasets'
    {path: '', pathMatch: 'full', redirectTo: 'datasets'},

    // Redirect signed in user to the '/datasets'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all datasets routes together here on this file.
    {path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'datasets'},

    // Auth routes for authenticated users
    // {
    //     path: '',
    //     canActivate: [AuthGuard],
    //     canActivateChild: [AuthGuard],
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {
    //             path: 'sign-out',
    //             loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)
    //         },
    //         {
    //             path: 'unlock-session',
    //             loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)
    //         }
    //     ]
    // },

    // Landing routes
    // {
    //     path: '',
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {
    //             path: 'home',
    //             loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)
    //         },
    //     ]
    // },

    // Admin routes
    {
        path: '',
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            {
                path: 'layers',
                loadChildren: () => import('app/modules/admin/layers/layers.module').then(m => m.LayersModule)
            },
        ]
    }
];
