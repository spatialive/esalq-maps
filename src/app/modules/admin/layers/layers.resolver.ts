import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import {WmsService} from '../../../shared/wms/wms.service';

@Injectable({
    providedIn: 'root'
})
export class LayersResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private wmsService: WmsService
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
        return forkJoin([
            this.wmsService.get()
        ]);
    }
}
