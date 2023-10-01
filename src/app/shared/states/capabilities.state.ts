import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Layer} from '../interfaces';
@Injectable({
    providedIn: 'root'
})
export class CapabilitiesState {
    private capabilities$: BehaviorSubject<Layer> = new BehaviorSubject<Layer>(null);
    getState(): Observable<Layer> {
        return this.capabilities$.asObservable();
    }
    setState(layer: any): void {
        this.capabilities$.next(layer);
    }
}
