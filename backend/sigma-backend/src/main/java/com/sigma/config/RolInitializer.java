package com.sigma.config;

import com.sigma.entity.Rol;
import com.sigma.repository.RolRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class RolInitializer implements ApplicationRunner {

    private final RolRepository rolRepository;

    public RolInitializer(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        Rol aspirante = rolRepository.findByNombreIgnoreCase("ASPIRANTE")
                .orElseGet(() -> {
                    Rol nuevoRol = new Rol();
                    nuevoRol.setNombre("ASPIRANTE");
                    return nuevoRol;
                });

        aspirante.setNombre("ASPIRANTE");
        if (aspirante.getDescripcion() == null
                || aspirante.getDescripcion().isBlank()) {
            aspirante.setDescripcion("Personal en formación");
        }

        rolRepository.save(aspirante);
    }
}
