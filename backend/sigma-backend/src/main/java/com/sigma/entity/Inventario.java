package com.sigma.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventario")
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_unidad", nullable = false)
    private Unidad unidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_responsable", nullable = false)
    private Usuario responsable;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoInventario estado;

    @Enumerated(EnumType.STRING)
    @Column(name = "resultado_general", length = 30)
    private ResultadoInventario resultadoGeneral;

    public Inventario() {
    }

    public Long getId() {
        return id;
    }

    public Unidad getUnidad() {
        return unidad;
    }

    public void setUnidad(Unidad unidad) {
        this.unidad = unidad;
    }

    public Usuario getResponsable() {
        return responsable;
    }

    public void setResponsable(Usuario responsable) {
        this.responsable = responsable;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

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