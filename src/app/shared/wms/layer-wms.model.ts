export class LayerWms {
    name: string;
    title: string;
    queryable: boolean;
    url: string;
    layers: LayerWms[];
    constructor(layer: any, layers: LayerWms[]) {
       this.name = layer?.name;
       this.title = layer?.title;
       this.queryable = layer?.queryable;
       this.layers = layers;
    }
}
