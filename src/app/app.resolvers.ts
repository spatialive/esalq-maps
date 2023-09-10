import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { ShortcutsService } from 'app/layout/common/shortcuts/shortcuts.service';
import {BiomesService, LayersService, MunicipalitiesService, StatesService} from './shared/services';
import {CountryService} from "./shared/services/country.service";

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
        private _biomesService: BiomesService,
        private _statesService: StatesService,
        private _municipalitiesService: MunicipalitiesService,
        private _countryService: CountryService
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
            this._countryService.get(),
            this._biomesService.get(),
            this._statesService.get(),
            this._municipalitiesService.get(),
            this._shortcutsService.getAll(),
            this._navigationService.get(),
        ]);
    }
}
