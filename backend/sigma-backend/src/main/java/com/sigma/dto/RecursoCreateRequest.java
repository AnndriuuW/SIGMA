package com.sigma.dto;

import com.sigma.entity.EstadoRecurso;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RecursoCreateRequest {

    @NotBlank(message = "El código es obligatorio")
    @Size(max = 30, message = "El código no puede superar los 30 caracteres")
    private String codigo;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @NotBlank(message = "La marca es obligatoria")
    @Size(max = 80, message = "La marca no puede superar los 80 caracteres")
    private String marca;

    @Size(max = 80, message = "El modelo no puede superar los 80 caracteres")
    private String modelo;

    @Size(max = 100, message = "El número de serie no puede superar los 100 caracteres")
    private String numeroSerie;

    @Size(max = 20, message = "La longitud no puede superar los 20 caracteres")
    private String longitud;

    @NotNull(message = "El estado es obligatorio")
    private EstadoRecurso estado;

    @NotNull(message = "El tipo de recurso es obligatorio")
    private Long idTipoRecurso;

    @NotNull(message = "La ubicación es obligatoria")
    private Long idUbicacion;

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(String numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public String getLongitud() {
        return longitud;
    }

    public void setLongitud(String longitud) {
        this.longitud = longitud;
    }

    public EstadoRecurso getEstado() {
        return estado;
    }

    public void setEstado(EstadoRecurso estado) {
        this.estado = estado;
    }

    public Long getIdTipoRecurso() {
        return idTipoRecurso;
    }

    public void setIdTipoRecurso(Long idTipoRecurso) {
        this.idTipoRecurso = idTipoRecurso;
    }

    public Long getIdUbicacion() {
        return idUbicacion;
    }

    public void setIdUbicacion(Long idUbicacion) {
        this.idUbicacion = idUbicacion;
    }
}