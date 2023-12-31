export interface Layer {
    Name?: string;
    Title?: string;
    Abstract?: string;
    KeywordList?: string[];
    BoundingBox?: BoundingBox[];
    Style?: Style[];
    Layer?: Layer[];
    queryable?: boolean;
    opaque?: boolean;
    noSubsets?: boolean;
    visible?: boolean;
}
export interface BoundingBox {
    crs: any;
    extent: number[];
    res: any[];
}
export interface Style {
    Name?: string;
    Title?: string;
    LegendURL?: LegendUrl[];
}
export interface LegendUrl {
    Format?: string;
    OnlineResource?: string;
    size?: number[];
}
