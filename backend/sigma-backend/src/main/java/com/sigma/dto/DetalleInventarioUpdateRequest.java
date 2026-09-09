package com.sigma.dto;

import jakarta.validation.constraints.NotNull;

public class DetalleInventarioUpdateRequest {

    @NotNull(message = "El estado de verificación es obligatorio")
    private Boolean verificado;

    private String observacion;

    public DetalleInventarioUpdateRequest() {
    }

    public Boolean getVerificado() {
        return verificado;
    }

    public void setVerificado(Boolean verificado) {
        this.verificado = verificado;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }
}