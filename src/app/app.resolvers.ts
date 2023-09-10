import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import {LayersService} from './shared';
import {WfsService} from './shared';

@Injectable({
    providedIn: 'root'
})
export class InitialDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _navigationService: NavigationService,
        private _shortcutsService: ShortcutsService,
        private _layersService: LayersService,
        private readonly wfsService: WfsService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Use this resolver to resolve initial mock-api for the application
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {
        // Fork join multiple API endpoint calls to wait all of them to finish
        return forkJoin([
            this._layersService.get(),
            this.wfsService.getBrasil(),
            this.wfsService.getEstados(),
            this.wfsService.getBiomas(),
            this.wfsService.getMunicipios(),
            this._shortcutsService.getAll(),
            this._navigationService.get(),
        ]);
    }
}
