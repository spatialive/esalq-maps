import {Layer} from '../interfaces';
export const  flattenLayers =  (layers): Layer[]  => {
    let flatLayers = [];

    layers.forEach((layer) => {
        flatLayers.push({
            ...layer,
            Layer: undefined
        });

        // If this layer has nested layers, flatten them as well
        if (layer.Layer && layer.Layer.length > 0) {
            flatLayers = flatLayers.concat(flattenLayers(layer.Layer));
        }
    });

    return flatLayers;
};
