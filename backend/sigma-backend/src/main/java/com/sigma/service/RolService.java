package com.sigma.service;

import com.sigma.entity.Rol;
import com.sigma.repository.RolRepository;
import org.springframework.stereotype.Service;

@Service
public class RolService {

    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public Rol guardar(Rol rol) {
        return rolRepository.save(rol);
    }
}
