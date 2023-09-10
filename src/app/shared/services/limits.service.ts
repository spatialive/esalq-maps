import {Injectable} from '@angular/core';
import {catchError, map, Observable, of, ReplaySubject, take} from 'rxjs';
import {Layer} from '../interfaces';
import {LayersService} from './layers.service';
@Injectable({
    providedIn: 'root'
})
export class LimitsService {
    private _limits: ReplaySubject<Layer[]> = new ReplaySubject<Layer[]>();
    constructor(
        private readonly layersService: LayersService,
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------
    /**
     * Setter & getter for user
     *
     * @param value
     */
    get limits$(): Observable<Layer[]> {
        return this._limits.asObservable();
    }

    set limits(value: Layer[]) {
        this._limits.next(value);
    }
    get(layers: Layer[]): void {
        let limits: Layer[] = [];
        if (Array.isArray(layers)) {
            limits = layers.filter(lay => lay.Name.includes('teeb:camada_'));
        }
        this.limits = limits;
    }
    /**
     * Updates a property of a limit by Name.
     *
     * @param name The name of the limit.
     * @param propName The property to update.
     * @param newValue The new value for the property.
     */
    updateLimitPropertyByName(name: string, propName: string, newValue: any): void {
        this._limits.pipe(take(1)).subscribe((limits) => {
            const index = limits.findIndex(limit => limit.Name === name);
            if (index !== -1) {
                limits[index][propName] = newValue;
            }
            this._limits.next(limits);
        });
    }
    updateLimitVisibility(name: string, visible: boolean): void {
        this._limits.pipe(take(1)).subscribe((limits) => {
            const index = limits.findIndex(limit => limit.Name === name);
            if (index !== -1) {
                limits[index]['visible'] = visible;
            } else {
                limits[index]['visible'] = false;
            }
            this._limits.next(limits);
        });
    }
}

