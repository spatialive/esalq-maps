import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, ReplaySubject} from 'rxjs';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import {environment} from '../../../environments/environment';
import {Feature, FeatureCollection, Layer} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class MunicipalitiesService {
    private _municipalities: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();
    private wmsUrl: string;
    constructor(
        private _http: HttpClient,
    ) {
        this.wmsUrl = `${environment.geoserverUrl}/geoserver/ows`;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    /**
     * Setter & getter for user
     *
     * @param value
     */
    get municipalities$(): Observable<Feature[]> {
        return this._municipalities.asObservable();
    }

    set municipalities(value: Feature[]) {
        this._municipalities.next(value);
    }
    get(): Observable<Feature[]> {
        // eslint-disable-next-line max-len
        const municipalitiesParams = '?service=WFS&version=1.0.0&request=GetFeature&typeName=teeb%3Acamada_municipios&outputFormat=application%2Fjson&format_options=CHARSET:UTF-8&propertyName=CD_MUN,NM_MUN,SIGLA_UF,AREA_KM2,BAU_AGR,BAU_PAS,BAU_VN,S1_AGR,S1_PAS,S1_VN,S2_AGR,S2_PAS,S2_VN,S1_PD,S1_PSD,S1_RPD,S2_PD,S2_PSD,S2_RPD,S2_ILP,BAU_DESM,BAU_REG,BAU_VNM,S1_DESM,S1_REG,S1_VNM,S2_DESM,S2_REG,S2_VNM';
        return this._http.get<FeatureCollection>(`${this.wmsUrl}${municipalitiesParams}`)
            .pipe(
                map((collection: FeatureCollection) => {
                    this.municipalities = collection.features;
                    return collection.features;
                }),
                catchError((error) => {
                    console.error('Error to get municipalities from Map Server', error);
                    this.municipalities = [];
                    return of([]);
                })
            );
    }
}

