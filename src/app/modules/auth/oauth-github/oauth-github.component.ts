import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {fuseAnimations} from '@fuse/animations';
import {FuseAlertType} from '@fuse/components/alert';
import {AuthService} from 'app/core/auth/auth.service';

@Component({
    selector: 'oauth-github',
    templateUrl: './oauth-github.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class OauthGithubComponent implements OnInit {
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._activatedRoute.queryParams.subscribe((params: any) => {
            if (params) {
                this._authService.signInOauth(params).subscribe(() => {
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                    this._router.navigateByUrl(redirectURL);
                }, (error) => {
                    this.alert = {
                        type: 'error',
                        message: `Authorization failed. ${error.error.message}`
                    };
                    this.showAlert = true;
                });
            }
        });
    }

}
