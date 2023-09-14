export const setHighestZIndex = (map, layer): void=> {
    const layers = map.getLayers().getArray();
    const maxZIndex = Math.max(...layers.map(l => l.getZIndex() || 0));
    layer.setZIndex(maxZIndex + 1);
}
