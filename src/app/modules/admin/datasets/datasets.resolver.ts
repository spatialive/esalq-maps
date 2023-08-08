import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import {DatasetsService} from 'app/modules/admin/datasets/datasets.service';

@Injectable({
    providedIn: 'root'
})
export class DatasetsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private datasetService: DatasetsService,
    )
    {
    }

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
            this.datasetService.get()
        ]);
    }
}
