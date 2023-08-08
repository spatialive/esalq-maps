import {Component, Input, ViewEncapsulation} from '@angular/core';
import {Dataset} from 'app/modules/admin/datasets/datasets.types';
import {DatasetsService} from '../datasets.service';

@Component({
    selector: 'dataset-item',
    templateUrl: './dataset-item.component.html',
    styleUrls: ['./dataset-item.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DatasetItemComponent {
    public _dataset: Dataset;
    public featuresLength: number;

    /**
     * Constructor
     */
    constructor(
        private datasetService: DatasetsService
    ) {
        this.featuresLength = null;
    }

    @Input() set dataset(value: Dataset) {
        if (value) {
            this._dataset = value;
            this.countFeatures();
        }
    };
    countFeatures(): void{
        this.datasetService.countFeatures(this._dataset._id).subscribe((length) => {
            this.featuresLength = length;
        });
    }
}
