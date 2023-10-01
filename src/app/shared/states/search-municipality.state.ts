import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class SearchMunicipalityState {
    private _codigo$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    get codigo$(): Observable<string> {
        return this._codigo$.asObservable();
    }
    set codigo(codigo: any) {
        this._codigo$.next(codigo);
    }
}
