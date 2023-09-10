import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, ReplaySubject, take} from 'rxjs';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import {environment} from '../../../environments/environment';
import {Feature, FeatureCollection, Layer} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class BiomesService {
    private _biomes: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();
    private wmsUrl: string;
    constructor(
        private _http: HttpClient,
    ) {
        this.wmsUrl = `${environment.geoserverUrl}/geoserver/teeb/ows`;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    /**
     * Setter & getter for user
     *
     * @param value
     */
    get biomes$(): Observable<Feature[]> {
        return this._biomes.asObservable();
    }

    set biomes(value: Feature[]) {
        this._biomes.next(value);
    }
    get(): Observable<Feature[]> {
        // eslint-disable-next-line max-len
        const biomesParams = '?service=WFS&version=1.0.0&request=GetFeature&typeName=teeb%3Acamada_biomas&outputFormat=application%2Fjson&format_options=CHARSET:UTF-8&propertyName=CD_Bioma,Bioma,BAU_AGR,BAU_PAS,BAU_VN,S1_AGR,S1_PAS,S1_VN,S2_AGR,S2_PAS,S2_VN,S1_PD,S1_PSD,S1_RPD,S2_PD,S2_PSD,S2_RPD,S2_ILP,BAU_DESM,BAU_REG,BAU_VNM,S1_DESM,S1_REG,S1_VNM,S2_DESM,S2_REG,S2_VNM';
        return this._http.get<FeatureCollection>(`${this.wmsUrl}${biomesParams}`)
            .pipe(
                map((collection: FeatureCollection) => {
                    this.biomes = collection.features;
                    return collection.features;
                }),
                catchError((error) => {
                    console.error('Error to get biomes from Map Server', error);
                    this.biomes = [];
                    return of([]);
                })
            );
    }
}

