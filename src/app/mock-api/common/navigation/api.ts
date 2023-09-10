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

                                const navigationItem: FuseNavigationItem = {
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
                                this._compactNavigation.push(navigationItem);
                                this._futuristicNavigation.push(navigationItem);
                                this._defaultNavigation.push(navigationItem);
                                this._horizontalNavigation.push(navigationItem);
                                this._compactNavigation.push(navigationItem);
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
}
