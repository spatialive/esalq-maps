import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, of, ReplaySubject, take} from 'rxjs';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import {environment} from '../../../environments/environment';
import {Layer} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class LayersService {
    private _layers: ReplaySubject<Layer[]> = new ReplaySubject<Layer[]>();
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
    get layers$(): Observable<Layer[]> {
        return this._layers.asObservable();
    }

    set layers(value: Layer[]) {
        this._layers.next(value);
    }
    get(): Observable<any[]> {
        return this._http.get(`${this.wmsUrl}?service=wms&version=1.1.1&request=GetCapabilities`, { responseType: 'text' })
            .pipe(
                map((value) => {
                    const capabilities = this.parseWMSCapabilities(value);
                    this.layers = capabilities;
                    return capabilities;
                }),
                catchError((error) => {
                    console.error('Error to get Capabilities from Map Server', error);
                    this.layers = [];
                    return of([]);
                })
            );
    }
    parseWMSCapabilities(response: string): any {
        const parser: WMSCapabilities = new WMSCapabilities();
        const parsedResult = parser.read(response);
        const layersArray = parsedResult?.Capability?.Layer.Layer;

        let layers = [];

        if (Array.isArray(layersArray)) {
            layers = layersArray.filter(lay => lay.Name.includes('teeb:'));
        }
        return layers;
    }
    /**
     * Updates a property of a biome by Name.
     *
     * @param name The name of the biome.
     * @param propName The property to update.
     * @param newValue The new value for the property.
     */
    updateLayerPropertyByName(name: any, propName: string, newValue: any): void {
        this._layers.pipe(take(1)).subscribe((layers) => {
            const index = layers.findIndex(lay => lay.Name === name);
            if (index !== -1) {
                layers[index][propName] = newValue;
                this._layers.next(layers);
            }
        });
    }
    updateLayerVisibility(name: string, visible: boolean): void {
        this._layers.pipe(take(1)).subscribe((layers) => {
            const index = layers.findIndex(limit => limit.Name === name);
            if (index !== -1) {
                console.log(layers[index]);
                layers[index]['visible'] = visible;
                this._layers.next(layers);
            }
        });
    }
}

