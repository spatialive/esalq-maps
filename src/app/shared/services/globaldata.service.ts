import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class GlobalDataService {
    private _mapLayerNames: any;

    constructor() {
        this._mapLayerNames = {
            municipios: 'teeb:camada_municipios',
            estados: 'teeb:camada_estados',
            biomas: 'teeb:camada_biomas',
            brasil: 'teeb:camada_br',
            frentesDesmatamento: 'teeb:camada_frentes_desmatamento_BR_sirgas'
        };
    }

    set mapLayerNames(value: any) {
        this._mapLayerNames = value;
    }

    get mapLayerNames$(): any {
        return this._mapLayerNames;
    }
}

