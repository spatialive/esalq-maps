import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Translation, TranslocoLoader } from '@ngneat/transloco';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TranslocoHttpLoader implements TranslocoLoader
{
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get translation
     *
     * @param lang
     */
    getTranslation(lang: string): Observable<Translation>
    {
        return this._httpClient.get<Translation>(`${environment.langUrl}/assets/i18n/${lang}.json`);
    }
}
