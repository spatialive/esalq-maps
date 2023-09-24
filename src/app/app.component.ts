import { Component } from '@angular/core';
import {getBrowserLang, TranslocoService} from '@ngneat/transloco';

@Component({
    selector   : 'app-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    /**
     * Constructor
     */
    constructor(private translocoService: TranslocoService) {
        const savedLang = localStorage.getItem('userLang');
        const blang = getBrowserLang();
        const browserLang = blang === 'pt' ? blang : 'en';
        const effectiveLang = savedLang || browserLang;
        console.log('effectiveLang', effectiveLang);
        this.translocoService.setActiveLang(effectiveLang);
    }
}
