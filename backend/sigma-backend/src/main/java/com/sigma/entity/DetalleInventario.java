package com.sigma.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "detalle_inventario",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"id_inventario", "id_recurso"}
    )
)
public class DetalleInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_inventario", nullable = false)
    private Inventario inventario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_recurso", nullable = false)
    private Recurso recurso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_verificado_por", nullable = false)
    private Usuario verificadoPor;

    @Column(nullable = false)
    private Boolean verificado;

    @Column(name = "fecha_verificacion", nullable = false)
    private LocalDateTime fechaVerificacion;

    @Column(columnDefinition = "TEXT")
    private String observacion;

    public DetalleInventario() {
    }

    public Long getId() {
        return id;
    }

    public Inventario getInventario() {
        return inventario;
    }

    public void setInventario(Inventario inventario) {
        this.inventario = inventario;
    }

    public Recurso getRecurso() {
        return recurso;
    }

    public void setRecurso(Recurso recurso) {
        this.recurso = recurso;
    }

    public Usuario getVerificadoPor() {
        return verificadoPor;
    }

    public void setVerificadoPor(Usuario verificadoPor) {
        this.verificadoPor = verificadoPor;
    }

    public Boolean getVerificado() {
        return verificado;
    }

    public void setVerificado(Boolean verificado) {
        this.verificado = verificado;
    }

    public LocalDateTime getFechaVerificacion() {
        return fechaVerificacion;
    }

    public void setFechaVerificacion(LocalDateTime fechaVerificacion) {
        this.fechaVerificacion = fechaVerificacion;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
    }
}