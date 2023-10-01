import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, ReplaySubject} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Feature, FeatureCollection, Layer} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    private _country: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();
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
    get country$(): Observable<Feature[]> {
        return this._country.asObservable();
    }

    set country(value: Feature[]) {
        this._country.next(value);
    }
    getFeature(): Observable<Feature> {
        // eslint-disable-next-line max-len
        const countryParams = `?service=WFS&version=1.0.0&request=GetFeature&typeName=teeb%3Acamada_br&outputFormat=application%2Fjson&format_options=CHARSET:UTF-8`;
        return this._http.get<FeatureCollection>(`${this.wmsUrl}${countryParams}`)
            .pipe(
                map((collection: FeatureCollection) => collection.features[0]),
                catchError(() => of(null))
            );
    }
}

