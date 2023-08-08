import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Dataset} from 'app/modules/admin/datasets/datasets.types';
import {Subject, takeUntil} from 'rxjs';
import {DatasetsService} from './datasets.service';
import {MatDialog} from '@angular/material/dialog';
import {UploadDatasetDialogComponent} from './upload-dataset-dialog/upload-dataset-dialog.component';

@Component({
    selector: 'admin-datasets',
    templateUrl: './datasets.component.html',
    styleUrls: ['./datasets.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DatasetsComponent implements OnInit {
    public datasets: Dataset[] = [];
    private unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private datasetService: DatasetsService,
        public dialog: MatDialog
    ) {
    }

    ngOnInit(): void {
        this.loadDatasets();
    }

    loadDatasets(): void {
        this.datasetService.datasets$
            .pipe(takeUntil(this.unsubscribeAll))
            .subscribe((datasets: Dataset[]) => {
                this.datasets = datasets;
            });
    }

    openUploader(): void {
        const dialogRef = this.dialog.open(UploadDatasetDialogComponent);
        dialogRef.afterClosed().subscribe((fileCreated) => {
            if(fileCreated){
                this.loadDatasets();
            }
        });
    }
}
