import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {LayerWms} from './layer-wms.model';
import {map, Observable, ReplaySubject} from 'rxjs';
import WMSCapabilities from 'ol/format/WMSCapabilities';
@Injectable({
    providedIn: 'root'
})
export class WmsService {
    private _layers: ReplaySubject<LayerWms[]> = new ReplaySubject<LayerWms[]>();
    private wmsUrl: string;
    constructor(private _http: HttpClient) {
        this.wmsUrl = '/geoservico/geoserver/ows?service=wms&version=1.1.1&request=GetCapabilities';
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
    get(): Observable<string> {
        return this._http.get(this.wmsUrl, { responseType: 'text' });
    }
    public getLayers(layer: any, url: string): LayerWms[] {
        return layer.layers.map((lay: LayerWms) => new LayerWms(lay, this.getLayers(lay, url), url));
    }
    public parseWMSCapabilities(response: string): WMSCapabilities {
        const parser: WMSCapabilities = new WMSCapabilities();
        return  parser.read(response);
    }
}
