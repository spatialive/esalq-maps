import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    SkipSelf,
} from '@angular/core';
import {
    ReplaceTexts,
    UploaderConfig,
    UploadInfo,
} from './uploader.types';
import {
    HttpClient,
    HttpHeaders,
    HttpParams,
    HttpEventType,
} from '@angular/common/http';

@Component({
    selector: 'uploader',
    templateUrl: './uploader.component.html',
    styleUrls: ['./uploader.component.scss'],
})
export class UploaderComponent implements OnChanges {
    // Inputs
    @Input()
    config: UploaderConfig;

    @Input()
    resetUpload = false;

    // Outputs
    @Output() apiResponse = new EventEmitter();

    @Output()
    fileSelected: EventEmitter<UploadInfo[]> = new EventEmitter<UploadInfo[]>();

    // Properties
    theme: string;
    id: number;
    hideProgressBar: boolean;
    maxSize: number;
    uploadAPI: string;
    method: string;
    formatsAllowed: string;
    formatsAllowedText: string;
    multiple: boolean;
    headers: HttpHeaders | { [header: string]: string | string[] };
    params: HttpParams | { [param: string]: string | string[] };
    responseType: 'json' | 'arraybuffer' | 'blob' | 'text';
    hideResetBtn: boolean;
    hideSelectBtn: boolean;
    allowedFiles: File[] = [];
    notAllowedFiles: {
        fileName: string;
        fileSize: string;
        errorMsg: string;
    }[] = [];
    caption: string[] = [];
    isAllowedFileSingle = true;
    progressBarShow = false;
    enableUploadBtn = false;
    uploadMsg = false;
    afterUpload = false;
    uploadStarted = false;
    uploadMsgText: string;
    uploadMsgClass: string;
    uploadPercent: number;
    replaceTexts: ReplaceTexts;
    fileNameIndex = true;
    withCredentials = false;
    autoUpload = false;

    private idDate: number = +new Date();

    constructor(@SkipSelf() private http: HttpClient) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        // Track changes in Configuration and see if user has even provided Configuration.
        if (changes.config && this.config) {
            // Assign User Configurations to Library Properties.
            this.theme = this.config.theme || '';
            this.id =
                this.config.id ||
                parseInt((this.idDate / 10000).toString().split('.')[1], 10) +
                Math.floor(Math.random() * 20) * 10000;
            this.hideProgressBar = this.config.hideProgressBar || false;
            this.hideResetBtn = this.config.hideResetBtn || false;
            this.hideSelectBtn = this.config.hideSelectBtn || false;
            this.maxSize = (this.config.maxSize || 20) * 1024000; // mb to bytes.
            this.uploadAPI = this.config.uploadAPI.url;
            this.method = this.config.uploadAPI.method || 'POST';
            this.formatsAllowed = this.config.formatsAllowed || '*';
            this.formatsAllowedText =
                this.formatsAllowed === '*' ? '' : '(' + this.formatsAllowed + ')';
            this.multiple = this.config.multiple || false;
            this.headers = this.config.uploadAPI.headers || {};
            this.params = this.config.uploadAPI.params || {};
            this.responseType = this.config.uploadAPI.responseType || 'json';
            this.withCredentials = this.config.uploadAPI.withCredentials || false;
            this.fileNameIndex = this.config.fileNameIndex === false ? false : true;
            this.autoUpload = this.config.autoUpload || false;

            this.replaceTexts = {
                selectFileBtn: this.multiple ? 'Select Files' : 'Select File',
                resetBtn: 'Reset',
                uploadBtn: 'Upload',
                dragNDropBox: 'Drag N Drop',
                attachPinBtn: this.multiple ? 'Attach Files...' : 'Attach File...',
                afterUploadMsgSuccess: 'Successfully Uploaded!',
                afterUploadMsgError: 'Upload Failed !',
                sizeLimit: 'Size Limit',
            }; // default replaceText.
            if (this.config.replaceTexts) {
                // updated replaceText if user has provided any.
                this.replaceTexts = {
                    ...this.replaceTexts,
                    ...this.config.replaceTexts,
                };
            }
        }

        // Reset when resetUpload value changes from false to true.
        if (changes.resetUpload) {
            if (changes.resetUpload.currentValue === true) {
                this.resetFileUpload();
            }
        }
    }

    // Reset following properties.
    resetFileUpload(): void {
        this.allowedFiles = [];
        this.caption = [];
        this.notAllowedFiles = [];
        this.uploadMsg = false;
        this.enableUploadBtn = false;
    }

    // When user selects files.
    onChange(event: any): void {
        this.fileSelected.emit(event);
        this.notAllowedFiles = [];
        const fileExtRegExp: RegExp = /(?:\.([^.]+))?$/;
        let fileList: FileList;

        if (this.afterUpload || !this.multiple) {
            this.allowedFiles = [];
            this.caption = [];
            this.afterUpload = false;
        }

        if (event.type === 'drop') {
            fileList = event.dataTransfer.files;
        } else {
            fileList = event.target.files || event.srcElement.files;
        }

        // 'forEach' does not exist on 'filelist' that's why this good old 'for' is used.
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < fileList.length; i++) {
            const currentFileExt = fileExtRegExp
                .exec(fileList[i].name)[1]
                .toLowerCase(); // Get file extension.
            const isFormatValid = this.formatsAllowed.includes('*')
                ? true
                : this.formatsAllowed.includes(currentFileExt);

            const isSizeValid = fileList[i].size <= this.maxSize;

            // Check whether current file format and size is correct as specified in the configurations.
            if (isFormatValid && isSizeValid) {
                this.allowedFiles.push(fileList[i]);
            } else {
                this.notAllowedFiles.push({
                    fileName: fileList[i].name,
                    fileSize: this.convertSize(fileList[i].size),
                    errorMsg: !isFormatValid ? 'Invalid format' : 'Invalid size',
                });
            }
        }

        // If there's any allowedFiles.
        if (this.allowedFiles.length > 0) {
            this.enableUploadBtn = true;
            // Upload the files directly if theme is attach pin (as upload btn is not there for this theme) or autoUpload is true.
            if (this.theme === 'attachPin' || this.autoUpload) {
                this.uploadFiles();
            }
        } else {
            this.enableUploadBtn = false;
        }

        this.uploadMsg = false;
        this.uploadStarted = false;
        this.uploadPercent = 0;
        event.target.value = null;
    }

    uploadFiles(): void {
        this.progressBarShow = true;
        this.uploadStarted = true;
        this.notAllowedFiles = [];
        let isError = false;
        this.isAllowedFileSingle = this.allowedFiles.length <= 1;
        const formData = new FormData();

        // Add data to be sent in this request
        // this.allowedFiles.forEach((file, i) => {
        //   formData.append(
        //     'file',
        //     this.allowedFiles[0]
        //   );
        // });

        formData.append(
            'file',
            this.allowedFiles[0]
        );

        this.http
            .request(this.method.toUpperCase(), this.uploadAPI, {
                body: formData,
                reportProgress: true,
                observe: 'events',
                headers: this.headers,
                params: this.params,
                responseType: this.responseType,
                withCredentials: this.withCredentials,
            })
            .subscribe(
                (event) => {
                    // Upload Progress
                    if (event.type === HttpEventType.UploadProgress) {
                        this.enableUploadBtn = false; // button should be disabled if process uploading
                        const currentDone = event.loaded / event.total;
                        this.uploadPercent = Math.round((event.loaded / event.total) * 100);
                    } else if (event.type === HttpEventType.Response) {
                        if (event.status === 200 || event.status === 201) {
                            // Success
                            this.progressBarShow = false;
                            this.enableUploadBtn = false;
                            this.uploadMsg = true;
                            this.afterUpload = true;
                            if (!isError) {
                                this.uploadMsgText = this.replaceTexts.afterUploadMsgSuccess;
                                this.uploadMsgClass = 'text-success lead';
                            }
                        } else {
                            // Failure
                            isError = true;
                            this.handleErrors();
                        }

                        this.apiResponse.emit(event);
                    } else {
                        //console.log('Event Other: ', event);
                    }
                },
                (error) => {
                    // Failure
                    isError = true;
                    this.handleErrors();
                    this.apiResponse.emit(error);
                }
            );
    }

    handleErrors(): void {
        this.progressBarShow = false;
        this.enableUploadBtn = false;
        this.uploadMsg = true;
        this.afterUpload = true;
        this.uploadMsgText = this.replaceTexts.afterUploadMsgError;
        this.uploadMsgClass = 'text-danger lead';
    }

    removeFile(i: any, sfNa: any): void {
        if (sfNa === 'sf') {
            this.allowedFiles.splice(i, 1);
            this.caption.splice(i, 1);
        } else {
            this.notAllowedFiles.splice(i, 1);
        }

        if (this.allowedFiles.length === 0) {
            this.enableUploadBtn = false;
        }
    }

    convertSize(fileSize: number): string {
        return fileSize < 1024000
            ? (fileSize / 1024).toFixed(2) + ' KB'
            : (fileSize / 1024000).toFixed(2) + ' MB';
    }

    attachpinOnclick(): void {
        const element = document.getElementById('sel' + this.id);
        if (element !== null) {
            element.click();
        }
    }

    drop(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.onChange(event);
    }

    allowDrop(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }
    getDate(timestamp: number): Date{
        return new Date(timestamp);
    }
}
