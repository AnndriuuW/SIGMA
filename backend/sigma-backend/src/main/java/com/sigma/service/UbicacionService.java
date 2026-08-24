package com.sigma.service;

import com.sigma.dto.UbicacionCreateRequest;
import com.sigma.dto.UbicacionResponse;
import com.sigma.dto.UbicacionUpdateRequest;
import com.sigma.entity.TipoUbicacion;
import com.sigma.entity.Ubicacion;
import com.sigma.entity.Unidad;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.exception.ReglaNegocioException;
import com.sigma.repository.UbicacionRepository;
import com.sigma.repository.UnidadRepository;
import org.springframework.stereotype.Service;
import com.sigma.exception.RecursoDuplicadoException;

import java.util.List;

@Service
public class UbicacionService {

        private final UbicacionRepository ubicacionRepository;
        private final UnidadRepository unidadRepository;

        public UbicacionService(
                        UbicacionRepository ubicacionRepository,
                        UnidadRepository unidadRepository) {

                this.ubicacionRepository = ubicacionRepository;
                this.unidadRepository = unidadRepository;
        }

        public UbicacionResponse crear(UbicacionCreateRequest request) {

                Unidad unidad = obtenerUnidad(request.getTipo(), request.getIdUnidad());

                if (request.getIdUnidad() != null
                        && ubicacionRepository.findByNombreAndUnidadIdAndActivoTrue(
                                request.getNombre(),
                                request.getIdUnidad()).isPresent()) {

                throw new RecursoDuplicadoException(
                        "Ya existe una ubicación con ese nombre en la unidad");
                }

                Ubicacion ubicacion = new Ubicacion();

                ubicacion.setNombre(request.getNombre());
                ubicacion.setTipo(request.getTipo());
                ubicacion.setUnidad(unidad);
                ubicacion.setActivo(true);

                Ubicacion guardada = ubicacionRepository.save(ubicacion);

                return convertirAResponse(guardada);
        }

        public List<UbicacionResponse> listar() {

                return ubicacionRepository.findAll()
                                .stream()
                                .filter(Ubicacion::getActivo)
                                .map(this::convertirAResponse)
                                .toList();
        }

        public UbicacionResponse buscarPorId(Long id) {

                Ubicacion ubicacion = ubicacionRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Ubicación no encontrada"));

                if (!ubicacion.getActivo()) {
                        throw new RecursoNoEncontradoException("Ubicación no encontrada");
                }

                return convertirAResponse(ubicacion);
        }

        public UbicacionResponse actualizar(
                        Long id,
                        UbicacionUpdateRequest request) {

                Ubicacion ubicacion = ubicacionRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Ubicación no encontrada"));

                                if (!ubicacion.getActivo()) {
                                throw new RecursoNoEncontradoException(
                                        "Ubicación no encontrada");
                                }
                                
                                Unidad unidad = obtenerUnidad(
                                request.getTipo(),
                                request.getIdUnidad());

                if (request.getIdUnidad() != null) {

                        var ubicacionExistente =
                                ubicacionRepository.findByNombreAndUnidadIdAndActivoTrue(
                                        request.getNombre(),
                                        request.getIdUnidad());

                        if (ubicacionExistente.isPresent()
                                && !ubicacionExistente.get().getId().equals(id)) {

                                throw new RecursoDuplicadoException(
                                        "Ya existe una ubicación con ese nombre en la unidad");
                        }
                }

                ubicacion.setNombre(request.getNombre());
                ubicacion.setTipo(request.getTipo());
                ubicacion.setUnidad(unidad);

                Ubicacion actualizada = ubicacionRepository.save(ubicacion);

                return convertirAResponse(actualizada);
        }

        public void desactivar(Long id) {

                Ubicacion ubicacion = ubicacionRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Ubicación no encontrada"));

                if (!ubicacion.getActivo()) {
                        throw new ReglaNegocioException(
                                        "La ubicación ya está desactivada");
                }

                ubicacion.setActivo(false);

                ubicacionRepository.save(ubicacion);
        }

        private Unidad obtenerUnidad(
                        TipoUbicacion tipo,
                        Long idUnidad) {

                if (tipo == TipoUbicacion.SALA_DE_OPERACIONES) {

                        if (idUnidad != null) {
                                throw new ReglaNegocioException(
                                                "La Sala de Operaciones no puede pertenecer a una unidad");
                        }

                        return null;
                }

                if (idUnidad == null) {
                        throw new ReglaNegocioException(
                                        "La ubicación debe pertenecer a una unidad");
                }

                return unidadRepository.findById(idUnidad)
                                .filter(Unidad::getActivo)
                                .orElseThrow(() -> new RecursoNoEncontradoException("Unidad no encontrada"));
        }

        private UbicacionResponse convertirAResponse(
                        Ubicacion ubicacion) {

                UbicacionResponse response = new UbicacionResponse();

                response.setId(ubicacion.getId());
                response.setNombre(ubicacion.getNombre());
                response.setTipo(ubicacion.getTipo());
                response.setActivo(ubicacion.getActivo());

                if (ubicacion.getUnidad() != null) {
                        response.setIdUnidad(ubicacion.getUnidad().getId());
                        response.setNombreUnidad(
                                        ubicacion.getUnidad().getNombre());
                }

                return response;
        }
}