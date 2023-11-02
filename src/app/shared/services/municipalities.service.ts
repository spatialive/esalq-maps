import {Injectable} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {CqlFilterCriteria} from '../interfaces';
import {WfsService} from "./wfs.service";
import {GlobalDataService} from "./globaldata.service";

@Injectable({
    providedIn: 'root'
})
export class MunicipalitiesService {
    constructor(
        private readonly wfsService: WfsService,
        private readonly globalDataService: GlobalDataService,
    ) {
    }
    getMunicipioByCodigo(codigo: string): Observable<any> {
        // Define the filter criteria
        const filter: CqlFilterCriteria = {
            property: 'CODIGO',
            value: codigo
        };

        // Call getFeaturesUsingFilter from the WFSService
        return this.wfsService.getFeaturesUsingCqlFilter(this.globalDataService.mapLayerNames$['municipios'], [filter])
            .pipe(
                map(features => features.length > 0 ? features[0] : null),
                catchError((error) => {
                    console.error('Error to get municipalities from Map Server', error);
                    return of(null);
                })
            );
    }
}

