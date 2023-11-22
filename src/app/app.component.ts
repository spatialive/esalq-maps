import {Component} from '@angular/core';
import {getBrowserLang, TranslocoService} from '@ngneat/transloco';
import {environment} from "../environments/environment";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    /**
     * Constructor
     */
    constructor(private translocoService: TranslocoService) {
        const head = document.getElementsByTagName('head')[0];
        const googleTagURL = document.createElement('script');
        const gtag = document.createElement('script');

        googleTagURL.async = true;
        googleTagURL.src = `https://www.googletagmanager.com/gtag/js?id=${environment.gtag}`;
        gtag.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${environment.gtag}');
        `;
        head.insertBefore(googleTagURL, head.lastChild);
        head.insertBefore(gtag, head.lastChild);

        const savedLang = localStorage.getItem('userLang');
        const blang = getBrowserLang();
        const browserLang = blang === 'pt' ? blang : 'en';
        const effectiveLang = savedLang || browserLang;
        this.translocoService
            .setActiveLang(effectiveLang);
    }
}
