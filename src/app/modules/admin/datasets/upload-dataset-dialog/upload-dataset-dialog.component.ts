import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {UploaderConfig} from '../../../../core/uploader/uploader.types';
import {AuthService} from '../../../../core/auth/auth.service';
import {MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../../../../core/user/user.service';

@Component({
    selector: 'upload-dataset-dialog',
    templateUrl: './upload-dataset-dialog.component.html',
    styleUrls: ['./upload-dataset-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class UploadDatasetDialogComponent implements OnInit {
    public uploadConfig: UploaderConfig;
    public errorMsg: string;
    /**
     * Constructor
     */
    constructor(
        private authService: AuthService,
        private userService: UserService,
        public dialogRef: MatDialogRef<UploadDatasetDialogComponent>,
    ) {
    }

    ngOnInit(): void {
        this.uploadConfig = {
            multiple: false,
            formatsAllowed: 'application/zip,application/octet-stream,ultipart/x-zip,application/zip-compressed,application/x-zip-compressed,application/x-zip',
            maxSize: 100000,
            uploadAPI: {
                url: environment.apiUrl + '/api/upload/file',
                method: 'POST',
                headers: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'Authorization': `Bearer ${this.authService.accessToken}`
                },
                params: {
                    'public': 'false',
                },
                responseType: 'blob',
                withCredentials: true,
            },
            theme: 'attachPin',
            hideProgressBar: false,
            autoUpload: true,
            replaceTexts: {
                selectFileBtn: 'Select Files',
                resetBtn: 'Reset',
                uploadBtn: 'Upload',
                dragNDropBox: 'Drag N Drop',
                attachPinBtn: 'Select file',
                afterUploadMsgSuccess: 'Successfully Uploaded!',
                afterUploadMsgError: 'Upload Failed!',
                sizeLimit: 'Size Limit'
            }
        };
    }

    close(): void {
        this.dialogRef.close(null);
    }

    onUpload(evt): void {
        this.errorMsg = null;
        if(evt.status === 201){
            this.dialogRef.close(true);
        } else{
            this.errorMsg = evt.message;
        }
    }
}
