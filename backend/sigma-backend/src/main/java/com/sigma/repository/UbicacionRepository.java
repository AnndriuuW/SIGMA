package com.sigma.repository;

import com.sigma.entity.Ubicacion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UbicacionRepository extends JpaRepository<Ubicacion, Long> {

    boolean existsByNombreAndUnidadId(String nombre, Long unidadId);
}