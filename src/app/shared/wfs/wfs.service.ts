import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, switchMap, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {BiomesService, CountryService, MunicipalitiesService, StatesService} from '../services';
import Point from "ol/geom/Point";
import {Coordinate} from "ol/coordinate";

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

    getMunicipios(properties?: string[]): Observable<any[]> {
        const layerName = this.mapperLayers['municipios'];

        const propertiesObservable = properties ? of(properties)
            : this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
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

    getEstados(properties?: string[]): Observable<any[]> {
        const layerName = this.mapperLayers['estados'];

        const propertiesObservable = properties ? of(properties)
            : this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
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

    getBiomas(properties?: string[]): Observable<any[]> {
        const layerName = this.mapperLayers['biomas'];

        const propertiesObservable = properties ? of(properties)
            : this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
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

    getBrasil(properties?: string[]): Observable<any[]> {
        const layerName = this.mapperLayers['brasil'];

        const propertiesObservable = properties ? of(properties)
            : this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
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

    getPointInfo(layerName: string, point: Coordinate): Observable<any>  {
        return this.getGeometryColumnName(layerName).pipe(
            switchMap(geometryColumnName => {
                if(!geometryColumnName) return throwError('Geometry column name could not be fetched');

                const wktPoint = `POINT(${point.join(' ')})`;

                const queryParams = {
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: layerName,
                    outputFormat: 'application/json',
                    format_options: 'CHARSET:UTF-8',
                    maxFeatures: 1,
                    propertyName: '',
                    CQL_FILTER: `INTERSECTS(${geometryColumnName}, ${wktPoint})`
                };

                return this._http.get(this.createUrl(queryParams)).pipe(
                    map(response => {
                        const features = response['features'];
                        return features && features.length > 0 ? features[0] : null;
                    })
                );
            }),
            catchError((error) => {
                console.error(error);
                return of(null);
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
            format_options: 'CHARSET:UTF-8',
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

    private getGeometryColumnName(layerName: string): Observable<string> {
        const queryParams = {
            service: 'WFS',
            version: '1.1.0',
            request: 'DescribeFeatureType',
            typeName: layerName,
            outputFormat: 'application/json' // specify the desired output format here
        };

        return this._http.get<any>(this.createUrl(queryParams)).pipe(
            map(response => {
                try {
                    // The structure of the response object depends on your geospatial server's output for DescribeFeatureType in JSON format.
                    // So you might need to adjust the path to access the properties array, based on the actual structure of your response.
                    const properties = response.featureTypes[0].properties || [];

                    const geometryProperty = properties.find((property: any) =>
                        ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'Geometry'].includes(property.localType)
                    );

                    return geometryProperty ? geometryProperty.name : '';
                } catch (error) {
                    console.error('Error parsing JSON response', error);
                    return '';
                }
            }),
            catchError((error) => {
                console.error('Error fetching DescribeFeatureType', error);
                return of('');
            })
        );
    }







}

