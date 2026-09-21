package com.sigma.service;

import com.sigma.dto.RecursoCreateRequest;
import com.sigma.dto.RecursoResponse;
import com.sigma.dto.RecursoUpdateRequest;
import com.sigma.entity.Recurso;
import com.sigma.entity.TipoRecurso;
import com.sigma.entity.Ubicacion;
import com.sigma.exception.RecursoDuplicadoException;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.exception.ReglaNegocioException;
import com.sigma.repository.RecursoRepository;
import com.sigma.repository.TipoRecursoRepository;
import com.sigma.repository.UbicacionRepository;
import org.springframework.stereotype.Service;
import com.sigma.dto.MovimientoRecursoResponse;
import com.sigma.entity.MovimientoRecurso;
import com.sigma.entity.Usuario;
import com.sigma.repository.MovimientoRecursoRepository;
import com.sigma.repository.UsuarioRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecursoService {

        private final RecursoRepository recursoRepository;
        private final TipoRecursoRepository tipoRecursoRepository;
        private final UbicacionRepository ubicacionRepository;
        private final MovimientoRecursoRepository movimientoRecursoRepository;
        private final UsuarioRepository usuarioRepository;

        public RecursoService(
                        RecursoRepository recursoRepository,
                        TipoRecursoRepository tipoRecursoRepository,
                        UbicacionRepository ubicacionRepository,
                        MovimientoRecursoRepository movimientoRecursoRepository,
                        UsuarioRepository usuarioRepository) {

                this.recursoRepository = recursoRepository;
                this.tipoRecursoRepository = tipoRecursoRepository;
                this.ubicacionRepository = ubicacionRepository;
                this.movimientoRecursoRepository = movimientoRecursoRepository;
                this.usuarioRepository = usuarioRepository;
        }

        public RecursoResponse crear(RecursoCreateRequest request) {

                if (recursoRepository.existsByCodigo(request.getCodigo())) {
                        throw new RecursoDuplicadoException(
                                        "Ya existe un recurso con ese código");
                }

                TipoRecurso tipoRecurso = tipoRecursoRepository.findById(
                                request.getIdTipoRecurso()).orElseThrow(
                                                () -> new RecursoNoEncontradoException(
                                                                "Tipo de recurso no encontrado"));

                Ubicacion ubicacion = ubicacionRepository.findById(
                                request.getIdUbicacion()).orElseThrow(
                                                () -> new RecursoNoEncontradoException(
                                                                "Ubicación no encontrada"));

                if (!ubicacion.getActivo()) {
                        throw new ReglaNegocioException(
                                        "No se puede asignar un recurso a una ubicación inactiva");
                }

                Recurso recurso = new Recurso();

                recurso.setCodigo(request.getCodigo());
                recurso.setNombre(request.getNombre());
                recurso.setMarca(request.getMarca());
                recurso.setModelo(request.getModelo());
                recurso.setNumeroSerie(request.getNumeroSerie());
                recurso.setLongitud(request.getLongitud());
                recurso.setEstado(request.getEstado());
                recurso.setTipoRecurso(tipoRecurso);
                recurso.setUbicacion(ubicacion);
                recurso.setActivo(true);

                Recurso guardado = recursoRepository.save(recurso);

                return convertirAResponse(guardado);
        }

        public List<RecursoResponse> listar() {

                return recursoRepository.findAll()
                                .stream()
                                .filter(Recurso::getActivo)
                                .map(this::convertirAResponse)
                                .toList();
        }

        public RecursoResponse buscarPorId(Long id) {

                Recurso recurso = recursoRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Recurso no encontrado"));

                if (!recurso.getActivo()) {
                        throw new RecursoNoEncontradoException(
                                        "Recurso no encontrado");
                }

                return convertirAResponse(recurso);
        }

        public RecursoResponse actualizar(
                        Long id,
                        RecursoUpdateRequest request) {

                Recurso recurso = recursoRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Recurso no encontrado"));

                if (!recurso.getActivo()) {
                        throw new RecursoNoEncontradoException(
                                        "Recurso no encontrado");
                }

                var recursoExistente = recursoRepository.findByCodigo(request.getCodigo());

                if (recursoExistente.isPresent()
                                && !recursoExistente.get().getId().equals(id)) {

                        throw new RecursoDuplicadoException(
                                        "Ya existe un recurso con ese código");
                }

                TipoRecurso tipoRecurso = tipoRecursoRepository.findById(
                                request.getIdTipoRecurso()).orElseThrow(
                                                () -> new RecursoNoEncontradoException(
                                                                "Tipo de recurso no encontrado"));

                Ubicacion ubicacion = ubicacionRepository.findById(
                                request.getIdUbicacion()).orElseThrow(
                                                () -> new RecursoNoEncontradoException(
                                                                "Ubicación no encontrada"));

                if (!ubicacion.getActivo()) {
                        throw new ReglaNegocioException(
                                        "No se puede asignar un recurso a una ubicación inactiva");
                }

                recurso.setCodigo(request.getCodigo());
                recurso.setNombre(request.getNombre());
                recurso.setMarca(request.getMarca());
                recurso.setModelo(request.getModelo());
                recurso.setNumeroSerie(request.getNumeroSerie());
                recurso.setLongitud(request.getLongitud());
                recurso.setEstado(request.getEstado());
                recurso.setTipoRecurso(tipoRecurso);
                recurso.setUbicacion(ubicacion);

                Recurso actualizado = recursoRepository.save(recurso);

                return convertirAResponse(actualizado);
        }

        @Transactional
        public RecursoResponse cambiarUbicacion(
                Long id,
                Long idUbicacion) {

        Recurso recurso = recursoRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Recurso no encontrado"));

        if (!recurso.getActivo()) {
                throw new RecursoNoEncontradoException(
                        "Recurso no encontrado");
        }

        Ubicacion ubicacionNueva = ubicacionRepository.findById(idUbicacion)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Ubicación no encontrada"));

        if (!ubicacionNueva.getActivo()) {
                throw new ReglaNegocioException(
                        "No se puede asignar el recurso a una ubicación inactiva");
        }

        Ubicacion ubicacionAnterior = recurso.getUbicacion();

        if (ubicacionAnterior != null
                && ubicacionAnterior.getId().equals(ubicacionNueva.getId())) {

                throw new ReglaNegocioException(
                        "El recurso ya se encuentra en esa ubicación");
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

                throw new RecursoNoEncontradoException(
                        "Usuario no autenticado");
        }

        String codigoUsuario = authentication.getName();

        Usuario usuario = usuarioRepository.findByCodigo(codigoUsuario)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario autenticado no encontrado"));

        if (!usuario.getActivo()) {
                throw new ReglaNegocioException(
                        "El usuario autenticado está inactivo");
        }

        recurso.setUbicacion(ubicacionNueva);

        Recurso actualizado = recursoRepository.save(recurso);

        MovimientoRecurso movimiento = new MovimientoRecurso();

        movimiento.setRecurso(actualizado);
        movimiento.setUbicacionAnterior(ubicacionAnterior);
        movimiento.setUbicacionNueva(ubicacionNueva);
        movimiento.setUsuario(usuario);
        movimiento.setFechaHora(java.time.LocalDateTime.now());

        movimientoRecursoRepository.save(movimiento);

        return convertirAResponse(actualizado);
        }

        public List<MovimientoRecursoResponse> listarHistorial(
                Long idRecurso) {

        Recurso recurso = recursoRepository.findById(idRecurso)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Recurso no encontrado"));

        if (!recurso.getActivo()) {
                throw new RecursoNoEncontradoException(
                        "Recurso no encontrado");
        }

        return movimientoRecursoRepository
                .findByRecursoIdOrderByFechaHoraDesc(idRecurso)
                .stream()
                .map(this::convertirMovimientoAResponse)
                .toList();
        }

        public void desactivar(Long id) {

                Recurso recurso = recursoRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Recurso no encontrado"));

                if (!recurso.getActivo()) {
                        throw new ReglaNegocioException(
                                        "El recurso ya está desactivado");
                }

                recurso.setActivo(false);

                recursoRepository.save(recurso);
        }

        private RecursoResponse convertirAResponse(Recurso recurso) {

                RecursoResponse response = new RecursoResponse();

                response.setId(recurso.getId());
                response.setCodigo(recurso.getCodigo());
                response.setNombre(recurso.getNombre());
                response.setMarca(recurso.getMarca());
                response.setModelo(recurso.getModelo());
                response.setNumeroSerie(recurso.getNumeroSerie());
                response.setLongitud(recurso.getLongitud());
                response.setEstado(recurso.getEstado());
                response.setActivo(recurso.getActivo());

                if (recurso.getTipoRecurso() != null) {
                        response.setIdTipoRecurso(
                                        recurso.getTipoRecurso().getId());

                        response.setNombreTipoRecurso(
                                        recurso.getTipoRecurso().getNombre());
                }

                if (recurso.getUbicacion() != null) {
                        response.setIdUbicacion(
                                        recurso.getUbicacion().getId());

                        response.setNombreUbicacion(
                                        recurso.getUbicacion().getNombre());
                }

                return response;
        }

        private MovimientoRecursoResponse convertirMovimientoAResponse(
                MovimientoRecurso movimiento) {

        MovimientoRecursoResponse response =
                new MovimientoRecursoResponse();

        response.setId(movimiento.getId());

        Recurso recurso = movimiento.getRecurso();

        response.setIdRecurso(recurso.getId());
        response.setCodigoRecurso(recurso.getCodigo());
        response.setNombreRecurso(recurso.getNombre());

        if (movimiento.getUbicacionAnterior() != null) {

                response.setIdUbicacionAnterior(
                        movimiento.getUbicacionAnterior().getId());

                response.setNombreUbicacionAnterior(
                        movimiento.getUbicacionAnterior().getNombre());

                if (movimiento.getUbicacionAnterior().getUnidad() != null) {
                response.setNombreUnidadAnterior(
                        movimiento.getUbicacionAnterior()
                                .getUnidad()
                                .getNombre());
                }
        }

        response.setIdUbicacionNueva(
                movimiento.getUbicacionNueva().getId());

        response.setNombreUbicacionNueva(
                movimiento.getUbicacionNueva().getNombre());

        if (movimiento.getUbicacionNueva().getUnidad() != null) {
                response.setNombreUnidadNueva(
                        movimiento.getUbicacionNueva()
                                .getUnidad()
                                .getNombre());
        }

        response.setCodigoUsuario(
                movimiento.getUsuario().getCodigo());

        response.setNombreUsuario(
                movimiento.getUsuario().getNombres()
                        + " "
                        + movimiento.getUsuario().getApellidos());

        response.setFechaHora(
                movimiento.getFechaHora());

        return response;
        }
}