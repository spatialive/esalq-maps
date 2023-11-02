import {Injectable, OnDestroy} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import {FuseMockApiService} from '@fuse/lib/mock-api';
import {MunicipalitiesService, WfsService, Feature, normalize, fixEncoding} from '../../../shared';
import {Subject, takeUntil} from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class SearchMockApi implements OnDestroy {
    private biomes: Feature[] = [];
    private states: any[] = [];
    private municipalities: any[] = [];
    private unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private readonly _fuseMockApiService: FuseMockApiService,
        private readonly municipalitiesService: MunicipalitiesService,
        private readonly wfsService: WfsService
    )
    {
        this.subscriptions();
        // Register Mock API handlers
        this.registerHandlers();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    subscriptions(): void{
        this.wfsService.biomes$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (biomes: Feature[]) => {
                   this.biomes = biomes;
                }
            });
        this.wfsService.states$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (states: Feature[]) => {
                    this.states = states;
                }
            });
        this.wfsService.municipalities$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe({
                next: (municipalities: Feature[]) => {
                    this.municipalities = municipalities;
                }
            });
    }
    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        // -----------------------------------------------------------------------------------------------------
        // @ Search results - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onPost('api/common/search')
            .reply(({request}) => {

                // Get the search query
                const query = cloneDeep(request.body.query.toLowerCase());

                // If the search query is an empty string,
                // return an empty array
                if ( query === '' )
                {
                    return [200, {results: []}];
                }

                // Filter the biomes
                const biomesResults = [];
                // const biomesResults = this.biomes
                //     .filter(biome => normalize(biome.properties.Bioma).includes(normalize(query)));

                // Filter the states
                const statesResults = [];
                // const statesResults = this.states
                //     .filter(state =>  normalize(state.properties.NM_UF).includes(normalize(query)));

                // Filter the municipalities
                const municipalitiesResults = this.municipalities
                    .filter(municipality =>  normalize(municipality.properties.TITULO).includes(normalize(query)));

                // Prepare the results array
                const results = [];

                // If there are contacts results...
                if ( biomesResults.length > 0 )
                {
                    const res = [];
                    // Normalize the results
                    biomesResults.forEach((biome) => {
                        res.push({
                            id     : biome.properties.CD_Bioma,
                            name  : biome.properties.Bioma,
                            value  : biome.properties.Bioma
                        });
                    });

                    // Add to the results
                    results.push({
                        id     : 'biomes',
                        label  : 'Biomes',
                        results: res
                    });
                }

                // If there are states results...
                if ( statesResults.length > 0 )
                {
                    const res = [];
                    // Normalize the results
                    statesResults.forEach((state: any) => {
                        res.push({
                            id     : state.properties.CD_UF,
                            name  : state.properties.NM_UF,
                            value  : state.properties.NM_UF
                        });
                    });

                    // Add to the results
                    results.push({
                        id     : 'states',
                        label  : 'States',
                        results: res
                    });
                }

                // If there are tasks results...
                if ( municipalitiesResults.length > 0 )
                {
                    const res = [];
                    // Normalize the results
                    municipalitiesResults.forEach((municipality) => {
                        res.push({
                            id     : municipality.properties.CODIGO,
                            name  : `${municipality.properties.TITULO} - ${municipality.properties.SIGLA_UF}`,
                            value  : municipality.properties.TITULO
                        });
                    });

                    // Add to the results
                    results.push({
                        id     : 'municipalities',
                        label  : 'Municipalities',
                        results: res
                    });
                }

                // Return the response
                return [200, results];
            });
    }
    ngOnDestroy(): void {
        this.unsubscribeAll.next(null);
        this.unsubscribeAll.complete();
    }

}
