import {
    ChangeDetectionStrategy,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {Layer, LimitsService} from '../../../shared';
import {Subject, takeUntil} from 'rxjs';

@Component({
    selector       : 'limits',
    templateUrl    : './limits.component.html',
    encapsulation  : ViewEncapsulation.None,
    exportAs       : 'limits'
})
export class LimitsComponent implements OnInit, OnDestroy {

    limits: Layer[];
    limitsSelected: Layer;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private readonly limitsService: LimitsService
    ) {
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.limitsService.limits$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (limits) => {
                    Promise.resolve().then(() => {
                        const limit = limits.find(l => l.visible);
                        this.limitsSelected =  limit ? limit : null;
                        this.limits = limits;
                    });
                }
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.Name || index;
    }
    onChangeLimit(limit: Layer): void {
        if (limit) {
            this.limitsSelected = limit;
            this.limitsService.updateLimitVisibility(limit.Name, true);
        }
    }
}
