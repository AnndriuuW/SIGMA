package com.sigma.repository;

import com.sigma.entity.Unidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnidadRepository extends JpaRepository<Unidad, Long> {

    boolean existsByNombre(String nombre);

    boolean existsByIndicativo(String indicativo);
}