import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil} from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Navigation } from 'app/core/navigation/navigation.types';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { User } from 'app/core/user/user.types';
import { UserService } from 'app/core/user/user.service';
import {MatDialog} from "@angular/material/dialog";
import {StatisticsDialogComponent} from "../../../../modules/admin/statistics/statistics-dialog.component";
import {environment} from "../../../../../environments/environment";
import {LayersService} from "../../../../shared";

@Component({
    selector     : 'classy-layout',
    templateUrl  : './classy.component.html',
    encapsulation: ViewEncapsulation.None
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    toggle: boolean = false;
    navigation: Navigation;
    user: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private cdr: ChangeDetectorRef,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        public dialog: MatDialog,
        private readonly layersService: LayersService
    )
    {
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) => {
                Object.keys(navigation).forEach((key) => {
                    this.updateBadgeById(navigation[key], environment.defaultLayer, { icon: 'heroicons_outline:check' });
                });
                this.navigation = navigation;
            });

        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) => {
                this.user = user;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });
    }

    updateBadgeById(items, id, newBadge): void {
        items.forEach((item) => {
            // Check if the current item is the one we're looking for
            if (item.id === id) {
                // Update the badge
                item.badge = newBadge;
            }

            // If the current item has children, apply the update recursively
            if (item.children && item.children.length > 0) {
                this.updateBadgeById(item.children, id, newBadge);
            }
        });
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);
        // this._fuseNavigationService.
        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
            this.toggle = !this.toggle;
        }
    }

    openStatisticsDialog(): void {
       this.dialog.open(StatisticsDialogComponent, {
            width: '98%',
            height: '90%',
            data: {title: 'Dados tabulares'},
        }).afterClosed().subscribe(() => {console.log('Statistics closed')});
    }
}
