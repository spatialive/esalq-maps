import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { WmsService } from '../wms/wms.service';

@Injectable({
    providedIn: 'root'
})
export class WMSCapabilitiesResolver implements Resolve<any> {
    constructor(private wmsService: WmsService) {}
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
       return this.wmsService.get();
    }
}
