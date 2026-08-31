package com.sigma.repository;

import com.sigma.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {
}