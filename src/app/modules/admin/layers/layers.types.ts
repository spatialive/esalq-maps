export interface Geometry {
    type: string;
    coordinates: number[];
}
export interface Feature {
    _id: string;
    dataset_id: string;
    biome: string;
    municipally: string;
    state: string;
    point_id: string;
    lat: number;
    lon: number;
    geometry: Geometry;
    epsg: number;
    properties: any;
}

export interface Collection {
    _id: string;
    file_name: string;
    username: string;
    public: boolean;
    columns: string[];
    epsg: number;
    created_at: Date;
    features: Feature[];
}
