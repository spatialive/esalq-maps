export interface FeatureCollection {
    type: string;
    features: Feature[];
    totalFeatures: number;
    numberMatched: number;
    numberReturned: number;
    timeStamp: string;
    crs: any;
}

export interface Feature {
    type: string;
    id: string;
    geometry: any;
    properties: any;
}

export interface CqlFilterCriteria {
    property: string;
    value: string;
}
