import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, ReplaySubject, tap} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {Feature} from './layers.types';

@Injectable({
    providedIn: 'root'
})
export class LayersService {
    private _features: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();
    private _apiUrl: string = '/api/features';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    /**
     * Setter & getter for user
     *
     * @param value
     */
    get features$(): Observable<Feature[]> {
        return this._features.asObservable();
    }

    set features(value: Feature[]) {
        // Store the value
        this._features.next(value);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get get all datasets by username
     */
    get(): Observable<Feature[]> {
        return this._httpClient.get<Feature[]>('/').pipe(
            tap((features) => {
                this._features.next(features);
            })
        );
    }

    /**
     * Get dataset-item by _id
     */
    getById(id: string): Observable<Feature> {
        return this._httpClient.get<Feature>(`${this._apiUrl}/${id}`).pipe(
            map(response => response)
        );
    }
    /**
     * getFeaturesByDatasetId
     */
    getByDatasetId(datasetId: string): Observable<Feature[]> {
        return this._httpClient.get<Feature[]>(`${this._apiUrl}/geopandas/dataset/${datasetId}`).pipe(
            map(response => response)
        );
    }
}
