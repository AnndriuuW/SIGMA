package com.sigma.dto;

import com.sigma.entity.TipoOcurrencia;

import java.time.LocalDateTime;

public class OcurrenciaResponse {

    private Long id;
    private LocalDateTime fechaHora;
    private TipoOcurrencia tipo;
    private String descripcion;

    private String codigoInformante;
    private String nombreInformante;

    private String codigoDestinatario;
    private String nombreDestinatario;

    private Long idUnidad;
    private String nombreUnidad;

    private Long idRecurso;
    private String codigoRecurso;

    private Boolean leida;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public TipoOcurrencia getTipo() {
        return tipo;
    }

    public void setTipo(TipoOcurrencia tipo) {
        this.tipo = tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getCodigoInformante() {
        return codigoInformante;
    }

    public void setCodigoInformante(String codigoInformante) {
        this.codigoInformante = codigoInformante;
    }

    public String getNombreInformante() {
        return nombreInformante;
    }

    public void setNombreInformante(String nombreInformante) {
        this.nombreInformante = nombreInformante;
    }

    public String getCodigoDestinatario() {
        return codigoDestinatario;
    }

    public void setCodigoDestinatario(String codigoDestinatario) {
        this.codigoDestinatario = codigoDestinatario;
    }

    public String getNombreDestinatario() {
        return nombreDestinatario;
    }

    public void setNombreDestinatario(String nombreDestinatario) {
        this.nombreDestinatario = nombreDestinatario;
    }

    public Long getIdUnidad() {
        return idUnidad;
    }

    public void setIdUnidad(Long idUnidad) {
        this.idUnidad = idUnidad;
    }

    public String getNombreUnidad() {
        return nombreUnidad;
    }

    public void setNombreUnidad(String nombreUnidad) {
        this.nombreUnidad = nombreUnidad;
    }

    public Long getIdRecurso() {
        return idRecurso;
    }

    public void setIdRecurso(Long idRecurso) {
        this.idRecurso = idRecurso;
    }

    public String getCodigoRecurso() {
        return codigoRecurso;
    }

    public void setCodigoRecurso(String codigoRecurso) {
        this.codigoRecurso = codigoRecurso;
    }

    public Boolean getLeida() {
        return leida;
    }

    public void setLeida(Boolean leida) {
        this.leida = leida;
    }
}