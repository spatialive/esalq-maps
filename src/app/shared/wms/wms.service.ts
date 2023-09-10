import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LayerWms} from './layer-wms.model';
import {catchError, map, Observable, of, ReplaySubject} from 'rxjs';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import {environment} from '../../../environments/environment';
import {CapabilitiesState} from '../state/capabilities.state';
import {MessagesService} from '../../layout/common/messages/messages.service';

@Injectable({
    providedIn: 'root'
})
export class WmsService {
    private _layers: ReplaySubject<LayerWms[]> = new ReplaySubject<LayerWms[]>();
    private wmsUrl: string;
    constructor(
        private _http: HttpClient,
        private readonly capabilitiesState: CapabilitiesState,
        private readonly messageSevice: MessagesService
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
    get layers$(): Observable<LayerWms[]> {
        return this._layers.asObservable();
    }

    set layers(value: LayerWms[]) {
        // Store the value
        this._layers.next(value);
    }
    get(): Observable<any[]> {
        return this._http.get(`${this.wmsUrl}?service=wms&version=1.1.1&request=GetCapabilities`, { responseType: 'text' })
            .pipe(
                map((value) => {
                    const capabilities = this.parseWMSCapabilities(value);
                    this.capabilitiesState.setState(capabilities);
                    return capabilities;
                }),
                catchError((error) => {
                    console.error(error);
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
}

