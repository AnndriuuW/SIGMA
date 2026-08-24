package com.sigma.repository;

import com.sigma.entity.Ubicacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UbicacionRepository extends JpaRepository<Ubicacion, Long> {

    Optional<Ubicacion> findByNombreAndUnidadIdAndActivoTrue(
            String nombre,
            Long unidadId
    );
}