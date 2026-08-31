package com.sigma.dto;

public class InventarioCreateRequest {

    private Long idUnidad;
    private String codigoResponsable;

    public Long getIdUnidad() {
        return idUnidad;
    }

    public void setIdUnidad(Long idUnidad) {
        this.idUnidad = idUnidad;
    }

    public String getCodigoResponsable() {
        return codigoResponsable;
    }

    public void setCodigoResponsable(String codigoResponsable) {
        this.codigoResponsable = codigoResponsable;
    }
}