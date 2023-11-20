import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, ReplaySubject, switchMap, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Coordinate} from "ol/coordinate";
import {fixEncoding} from "../utils";
import {CqlFilterCriteria, Feature, FeatureCollection} from "../interfaces";
import {GlobalDataService} from "./globaldata.service";

@Injectable({
    providedIn: 'root'
})
export class WfsService {

    private _biomes: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();
    private _country: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();
    private _states: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();
    private _municipalities: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();
    private _frentesDesmatamento: ReplaySubject<Feature[]> = new ReplaySubject<Feature[]>();

    private wfsUrl: string;
    constructor(
        private _http: HttpClient,
        private readonly globalDataService: GlobalDataService,
    ) {
        this.wfsUrl = `${environment.geoserverUrl}/geoserver/ows`;
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

    get country$(): Observable<Feature[]> {
        return this._country.asObservable();
    }

    set country(value: Feature[]) {
        this._country.next(value);
    }

    get states$(): Observable<Feature[]> {
        return this._states.asObservable();
    }

    set states(value: Feature[]) {
        this._states.next(value);
    }

    get municipalities$(): Observable<Feature[]> {
        return this._municipalities.asObservable();
    }

    set municipalities(value: Feature[]) {
        this._municipalities.next(value);
    }

    get frentesDesmatamento$(): Observable<Feature[]> {
        return this._frentesDesmatamento.asObservable();
    }

    set frentesDesmatamento(value: Feature[]) {
        this._frentesDesmatamento.next(value);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ WFS
    // -----------------------------------------------------------------------------------------------------
    /**
     * Métodos de Negócio para busca WFS
     *
     * @param value
     */
    getMunicipios(properties?: string[]): Observable<any[]> {
        const layerName = this.globalDataService.mapLayerNames$.municipios;

        const propertiesObservable = properties ? of(properties)
            : this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
            .pipe(
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        this.municipalities = response.features;
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
        const layerName = this.globalDataService.mapLayerNames$['estados'];

        const propertiesObservable = properties ? of(properties)
            : this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
            .pipe(
                // eslint-disable-next-line @typescript-eslint/no-shadow
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        response.features = response.features.map((feat) => {
                            feat.properties['TITULO'] = fixEncoding(feat.properties['TITULO']);
                            return feat;
                        });
                        this.states = response.features;
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
        const layerName = this.globalDataService.mapLayerNames$['biomas'];

        const propertiesObservable = properties ? of(properties)
            : this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
            .pipe(
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        response.features = response.features.map((feat) => {
                            feat.properties['TITULO'] = fixEncoding(feat.properties['TITULO']);
                            return feat;
                        });
                        this.biomes = response.features;
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
        const layerName = this.globalDataService.mapLayerNames$['brasil'];

        const propertiesObservable  = this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
            .pipe(
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        response.features = response.features.map((feat) => {
                            feat.properties['TITULO'] = fixEncoding(feat.properties['TITULO']);
                            return feat;
                        });
                        this.country = response.features;
                        // return response.features.map(feature => feature.properties);
                        return response.features[0];
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
    getFeatureBrasil(): Observable<Feature> {
        const layerName = this.globalDataService.mapLayerNames$['brasil'];
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
                map((collection: FeatureCollection) => collection.features[0]),
                catchError(() => of(null))
            );
    }
    getFrentesDesmatamento(properties?: string[]): Observable<any[]> {
        const layerName = this.globalDataService.mapLayerNames$['frentesDesmatamento'];

        const propertiesObservable = properties ? of(properties)
            : this.fetchLayerPropertyNames(layerName);

        return propertiesObservable
            .pipe(
                // eslint-disable-next-line @typescript-eslint/no-shadow
                switchMap(properties => this.requestWFSWithProperties(layerName, properties)),
                map((response) => {
                    // Map through each feature and extract the 'properties' field
                    if (response && Array.isArray(response.features)) {
                        response.features = response.features.map((feat) => {
                            feat.properties['TITULO'] = fixEncoding(feat.properties['TITULO']);
                            return feat;
                        });
                        this.frentesDesmatamento = response.features;
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

    getFeaturesUsingCqlFilter(layerName: string,filters?: CqlFilterCriteria[]): Observable<any> {
        return this.getGeometryColumnName(layerName).pipe(
            switchMap(geometryColumnName => {
                if (!geometryColumnName) {
                    return throwError(() => new Error('Geometry column name could not be fetched'));
                }

                let cqlFilters = '';
                if (filters && filters.length > 0) {
                    // Construct the CQL_FILTER string from the array of filters
                    cqlFilters = filters.map(filter => `${filter.property} = '${filter.value}'`).join(' AND ');
                }

                const queryParams = {
                    service: 'WFS',
                    version: '1.0.0',
                    request: 'GetFeature',
                    typeName: layerName,
                    outputFormat: 'application/json',
                    format_options: 'CHARSET:UTF-8',
                    maxFeatures: 1,
                    propertyName: '', // If you want to list specific property names, add them here separated by commas
                    CQL_FILTER: cqlFilters
                };

                return this._http.get(this.createUrl(queryParams)).pipe(
                    map(response => {
                        const features = response['features'];
                        return features && features.length > 0 ? features : [];
                    })
                );
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

