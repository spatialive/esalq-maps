import {Injectable} from '@angular/core';

// eslint-disable-next-line @typescript-eslint/ban-types
declare let gtag: Function;
@Injectable({
    providedIn: 'root'
})
export class GoogleAnalyticsService {

    constructor() {
    }

    /**
     * Examples:
     * this.googleAnalyticsService.eventEmitter("Analyze-Consulta-Upload-Layer", "Upload", this.layerFromConsulta.token);
     *
     * @param eventAction
     * @param eventCategory
     * @param eventLabel
     * @param eventValue
     */
    public eventEmitter(
        eventAction: string,
        eventCategory: string,
        eventLabel: string,
        eventValue?: number,
    ): void {
        gtag('event', eventAction, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'event_category': eventCategory,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'event_label': eventLabel,
            'value': eventValue ? eventValue : 1
        });
    }
}
