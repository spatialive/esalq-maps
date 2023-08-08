import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {finalize, Subject, takeUntil, takeWhile, tap, timer} from 'rxjs';
import {AuthService} from 'app/core/auth/auth.service';
import {SocialAuthService} from '@abacritt/angularx-social-login';

@Component({
    selector: 'auth-sign-out',
    templateUrl: './sign-out.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AuthSignOutComponent implements OnInit, OnDestroy {
    countdown: number = 5;
    countdownMapping: any = {
        '=1': '# second',
        'other': '# seconds'
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
        private _authServiceGoogle: SocialAuthService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Sign out
        const self = this;
        this._authService.signOut().subscribe(() => {
            this._authServiceGoogle.signOut(true).then(() => {
                timer(1000, 1000)
                    .pipe(
                        finalize(() => {
                            self._router.navigate(['sign-in']);
                        }),
                        takeWhile(() => self.countdown > 0),
                        takeUntil(this._unsubscribeAll),
                        tap(() => self.countdown--)
                    ).subscribe();
            }).catch(console.error);
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
