package com.sigma.dto;

import jakarta.validation.constraints.NotNull;

public class DetalleInventarioCreateRequest {

    @NotNull(message = "El inventario es obligatorio")
    private Long idInventario;

    @NotNull(message = "El recurso es obligatorio")
    private Long idRecurso;

    @NotNull(message = "El estado de verificación es obligatorio")
    private Boolean verificado;

    private String observacion;

    public DetalleInventarioCreateRequest() {
    }

    public Long getIdInventario() {
        return idInventario;
    }

    public void setIdInventario(Long idInventario) {
        this.idInventario = idInventario;
    }

    public Long getIdRecurso() {
        return idRecurso;
    }

    public void setIdRecurso(Long idRecurso) {
        this.idRecurso = idRecurso;
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