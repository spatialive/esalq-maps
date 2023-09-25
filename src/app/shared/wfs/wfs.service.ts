import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, switchMap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BiomesService, CountryService, MunicipalitiesService, StatesService} from '../services';

@Injectable({
    providedIn: 'root'
})
export class WfsService {
    private wfsUrl: string;
    private mapperLayers: any;
    constructor(
        private _http: HttpClient,
        private _biomesService: BiomesService,
        private _statesService: StatesService,
        private _municipalitiesService: MunicipalitiesService,
        private _countryService: CountryService,
    ) {
        this.wfsUrl = `${environment.geoserverUrl}/geoserver/ows`;
        this.mapperLayers = {
            municipios: 'teeb:camada_municipios',
            estados: 'teeb:camada_estados',
            biomas: 'teeb:camada_biomas',
            brasil: 'teeb:camada_br'
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    /**
     * Setter & getter for user
     *
     * @param value
     */

    getMunicipios(): Observable<any[]> {
        const layerName = this.mapperLayers['municipios'];
        return this.fetchLayerPropertyNames(layerName)
            .pipe(
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        this._municipalitiesService.municipalities = response.features;
                        return response.features.map(feature => feature.properties);
                    } else {
                        console.error('Features array not found or not an array in response', response);
                        return [];
                    }
                }),
                catchError((error) => {
                    console.error(error);
                    return of([]);
                })
            );
    }

    getEstados(): Observable<any[]> {
        const layerName = this.mapperLayers['estados'];
        return this.fetchLayerPropertyNames(layerName)
            .pipe(
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        this._statesService.states = response.features;
                        return response.features.map(feature => feature.properties);
                    } else {
                        console.error('Features array not found or not an array in response', response);
                        return [];
                    }
                }),
                catchError((error) => {
                    console.error(error);
                    return of([]);
                })
            );
    }

    getBiomas(): Observable<any[]> {
        const layerName = this.mapperLayers['biomas'];
        return this.fetchLayerPropertyNames(layerName)
            .pipe(
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        this._biomesService.biomes = response.features;
                        return response.features.map(feature => feature.properties);
                    } else {
                        console.error('Features array not found or not an array in response', response);
                        return [];
                    }
                }),
                catchError((error) => {
                    console.error(error);
                    return of([]);
                })
            );
    }

    getBrasil(): Observable<any[]> {
        const layerName = this.mapperLayers['brasil'];
        return this.fetchLayerPropertyNames(layerName)
            .pipe(
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        this._countryService.country = response.features;
                        return response.features.map(feature => feature.properties);
                    } else {
                        console.error('Features array not found or not an array in response', response);
                        return [];
                    }
                }),
                catchError((error) => {
                    console.error(error);
                    return of([]);
                })
            );
    }

    private requestWFSWithProperties(layerName: string, properties: string[]): Observable<any> {
        const queryParams = {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: layerName,
            outputFormat: 'application/json',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            format_options: 'CHARSET:ISO-8859-1',
            propertyName: properties.join(',')
        };

        return this._http.get(this.createUrl(queryParams), { responseType: 'json' })
            .pipe(
                map(response => response),
                catchError((error) => {
                    console.error(error);
                    return of(null);
                })
            );
    }

    private fetchLayerPropertyNames(layerName){
        const queryParams = {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typeName: layerName,
            maxFeatures: 1,
            outputFormat: 'application/json'
        };

        return this._http.get(this.createUrl(queryParams), { responseType: 'json' })
            .pipe(
                map((response) => {
                    const data: any = response;
                    if (data.features && data.features.length > 0) {
                        const firstFeatureProperties = data.features[0].properties;
                        return Object.keys(firstFeatureProperties);
                    }
                    return [];
                }),
                catchError((error) => {
                    console.error(error);
                    return of([]);
                })
            );
    }

    private createUrl(params: {[key: string]: any}): string {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        return `${this.wfsUrl}?${queryString}`;
    }
}

