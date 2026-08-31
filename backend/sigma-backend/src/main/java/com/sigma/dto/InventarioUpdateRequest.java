package com.sigma.dto;

import com.sigma.entity.EstadoInventario;
import com.sigma.entity.ResultadoInventario;

public class InventarioUpdateRequest {

    private EstadoInventario estado;
    private ResultadoInventario resultadoGeneral;

    public EstadoInventario getEstado() {
        return estado;
    }

    public void setEstado(EstadoInventario estado) {
        this.estado = estado;
    }

    public ResultadoInventario getResultadoGeneral() {
        return resultadoGeneral;
    }

    public void setResultadoGeneral(ResultadoInventario resultadoGeneral) {
        this.resultadoGeneral = resultadoGeneral;
    }
}