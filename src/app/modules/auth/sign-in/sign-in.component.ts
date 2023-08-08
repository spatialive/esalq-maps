import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, NgForm, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {fuseAnimations} from '@fuse/animations';
import {FuseAlertType} from '@fuse/components/alert';
import {AuthService} from 'app/core/auth/auth.service';
import qs from 'query-string';
import {uuid} from 'app/core/auth/auth.utils';
import {environment} from '../../../../environments/environment';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {GoogleLoginProvider, SocialAuthService} from '@abacritt/angularx-social-login';
import {Observable} from "rxjs";

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    @ViewChild('loginGoogle') public loginGoogle;
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private authServiceGoogle: SocialAuthService
    ) {
        this.matIconRegistry.addSvgIcon(
            'google',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/google.svg')
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', Validators.required],
            rememberMe: ['']
        });
        this.authServiceGoogle.initState.subscribe({
            complete: () => {
                this.authServiceGoogle.authState.subscribe((user) => {
            if (user) {
                this._authService.signInOauthGoogle(user).subscribe({
                    complete: () => {
                        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                        this._router.navigateByUrl(redirectURL);
                    },
                    error: (err) => {
                        console.log(err);
                        this.alert = {
                            type: 'error',
                            message: `Authorization failed. ${err.error.message}`
                        };
                        this._router.navigate(['sign-in']);
                        this.showAlert = true;
                    }
                });
            }
        });
            },
            error: console.error
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value)
            .subscribe(
                () => {

                    // Set the redirect url.
                    // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                    // to the correct page after a successful sign in. This way, that url can be set via
                    // routing file and we don't have to touch here.
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                    // Navigate to the redirect url
                    this._router.navigateByUrl(redirectURL);

                },
                (response) => {

                    // Re-enable the form
                    this.signInForm.enable();

                    // Reset the form
                    this.signInNgForm.resetForm();

                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message: `Wrong email or password. ${response.error.message}`
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }

    signInWithGithub(): void {
        const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const params = { response_type: 'code', scope: 'user public_repo', client_id: environment.clientId, redirect_uri: environment.redirectUrl, state: uuid() };
        const queryStrings = qs.stringify(params);
        const authorizationUrl = `${GITHUB_AUTH_URL}?${queryStrings}`;
        window.location.href = authorizationUrl;
    }
}
