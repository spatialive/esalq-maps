import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import {LayersService} from '../../../shared/services/layers.service';
import {take} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NavigationMockApi
{
    private _compactNavigation: FuseNavigationItem[] = [];
    private _defaultNavigation: FuseNavigationItem[] = [];
    private _futuristicNavigation: FuseNavigationItem[] = [];
    private _horizontalNavigation: FuseNavigationItem[] = [];

    /**
     * Constructor
     */
    constructor(
        private readonly _fuseMockApiService: FuseMockApiService,
        private readonly layersService: LayersService
    )
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------

        this._compactNavigation = [];
        this._futuristicNavigation = [];
        this._defaultNavigation = [];
        this._horizontalNavigation = [];
        this._fuseMockApiService
            .onGet('api/common/navigation')
            .reply(() => {
                this.layersService.layers$.pipe(take(1)).subscribe({
                    next: (layers) => {
                        if (Array.isArray(layers)) {
                            layers = layers.filter(l => !l.Name.includes('teeb:camada_'));
                            layers.forEach((lay) => {

                                const navigationItem = {
                                    active: false,
                                    id: lay.Name,
                                    title: lay.Title.toUpperCase(),
                                    type: 'basic',
                                    icon: 'mat_solid:layers',
                                    function: (item: FuseNavigationItem): void => {
                                        item.active = !item.active;
                                        item.badge = item.active ? {icon: 'heroicons_outline:check'} : null;
                                        this.layersService.updateLayerVisibility(item.id, item.active);
                                    }
                                };

                                this.updateOrPush(this._compactNavigation, navigationItem);
                                this.updateOrPush(this._futuristicNavigation, navigationItem);
                                this.updateOrPush(this._defaultNavigation, navigationItem);
                                this.updateOrPush(this._horizontalNavigation, navigationItem);

                            });
                        }
                    }
                });
                return [
                    200,
                    {
                        compact   : this._compactNavigation,
                        default   : this._defaultNavigation,
                        futuristic: this._futuristicNavigation,
                        horizontal: this._horizontalNavigation
                    }
                ];
            });
    }
    updateOrPush(targetArray: any[], newItem: any): void {
        const index = targetArray.findIndex(item => item.id === newItem.id);
        if (index !== -1) {
            targetArray[index] = newItem;
        } else {
            targetArray.push(newItem);
        }
    }
}
