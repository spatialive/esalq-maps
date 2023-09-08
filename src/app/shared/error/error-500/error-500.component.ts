import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import {TranslocoModule} from "@ngneat/transloco";

@Component({
    selector       : 'error-500',
    templateUrl    : './error-500.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports: [RouterLink, TranslocoModule],
})
export class Error500Component
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
