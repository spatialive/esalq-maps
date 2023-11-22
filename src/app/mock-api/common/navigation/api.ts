import { Injectable } from '@angular/core';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import {LayersService} from '../../../shared';
import {take} from 'rxjs';
import {GoogleAnalyticsService} from "../../../shared/services/google-analytics.service";

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
        private readonly layersService: LayersService,
        private readonly googleAnalyticsService: GoogleAnalyticsService,
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
                            layers = layers.filter(l => !l.Name.includes('teeb:camada'));
                            layers.forEach((lay) => {
                                const navigationItem: FuseNavigationItem = this.createNavigationItem(lay);
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
    createNavigationItem(lay): FuseNavigationItem {
        const navigationItem: FuseNavigationItem = {
            active: false,
            id: lay.Name,
            title: lay.Title.toUpperCase(),
            type: lay.Layer && Array.isArray(lay.Layer) ? 'collapsable' : 'basic',
            icon: lay.Layer && Array.isArray(lay.Layer) ? 'mat_solid:list' : 'mat_solid:layers',
        };

        if (navigationItem.type !== 'collapsable') {
            navigationItem.function = (item): void => {
                item.active = !item.active;
                item.badge = item.active ? { icon: 'heroicons_outline:check' } : null;
                this.layersService.updateLayerVisibility(item.id, item.active);
                this.googleAnalyticsService.eventEmitter('visualizar-layer', 'Camada', lay.Title);
            };
        }
        // Recursively add children if the 'Layer' property exists
        if (lay.Layer && Array.isArray(lay.Layer)) {
            navigationItem.children = lay.Layer.map(childLayer => this.createNavigationItem(childLayer));
        }

        return navigationItem;
    }
}
