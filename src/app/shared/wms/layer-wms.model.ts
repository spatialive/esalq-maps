export class LayerWms {
    name: string;
    title: string;
    queryable: boolean;
    url: string;
    layers: LayerWms[];
    constructor(layer: any, layers: LayerWms[], url: string) {
       this.name = layer?.name;
       this.title = layer?.title;
       this.queryable = layer?.queryable;
       this.layers = layers;
       this.url = url;
    }
}
