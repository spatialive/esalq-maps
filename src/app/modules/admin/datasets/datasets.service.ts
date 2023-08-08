import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, ReplaySubject, tap} from 'rxjs';
import {Dataset} from './datasets.types';
import {environment} from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DatasetsService {
    private _datasets: ReplaySubject<Dataset[]> = new ReplaySubject<Dataset[]>();
    private _apiUrl: string = environment.apiUrl + '/api/datasets';

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
    get datasets$(): Observable<Dataset[]> {
        return this._datasets.asObservable();
    }

    set datasets(value: Dataset[]) {
        // Store the value
        this._datasets.next(value);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get get all datasets by username
     */
    get(): Observable<Dataset[]> {
        return this._httpClient.get<Dataset[]>(`${this._apiUrl}/`).pipe(
            tap((datasets) => {
                this._datasets.next(datasets);
            })
        );
    }
    /**
     * Get dataset-item by _id
     */
    getById(id: string): Observable<Dataset> {
        return this._httpClient.get<Dataset>(`${this._apiUrl}/get/${id}`).pipe(
           map(response => response)
        );
    }
    /**
     * Get dataset-item by _id
     */
    countFeatures(id: string): Observable<number> {
        return this._httpClient.get<number>(`${this._apiUrl}/count-features/${id}`).pipe(
           map(response => response)
        );
    }
}
