package com.sigma.service;

import com.sigma.dto.OcurrenciaCreateRequest;
import com.sigma.dto.OcurrenciaResponse;
import com.sigma.entity.Ocurrencia;
import com.sigma.entity.Recurso;
import com.sigma.entity.TipoOcurrencia;
import com.sigma.entity.Unidad;
import com.sigma.entity.Usuario;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.exception.ReglaNegocioException;
import com.sigma.repository.OcurrenciaRepository;
import com.sigma.repository.RecursoRepository;
import com.sigma.repository.UnidadRepository;
import com.sigma.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OcurrenciaService {

        private final OcurrenciaRepository ocurrenciaRepository;
        private final UsuarioRepository usuarioRepository;
        private final UnidadRepository unidadRepository;
        private final RecursoRepository recursoRepository;

        public OcurrenciaService(
                        OcurrenciaRepository ocurrenciaRepository,
                        UsuarioRepository usuarioRepository,
                        UnidadRepository unidadRepository,
                        RecursoRepository recursoRepository) {

                this.ocurrenciaRepository = ocurrenciaRepository;
                this.usuarioRepository = usuarioRepository;
                this.unidadRepository = unidadRepository;
                this.recursoRepository = recursoRepository;
        }

        public OcurrenciaResponse crear(OcurrenciaCreateRequest request) {

                if (request.getIdUnidad() != null
                                && request.getIdRecurso() != null) {

                        throw new ReglaNegocioException(
                                        "Una ocurrencia no puede estar asociada simultáneamente a una unidad y un recurso");
                }

                Usuario informante = obtenerUsuarioAutenticado();

                Usuario destinatario = usuarioRepository.findById(
                                request.getCodigoDestinatario()).orElseThrow(
                                                () -> new RecursoNoEncontradoException(
                                                                "Destinatario no encontrado"));

                Unidad unidad = null;
                Recurso recurso = null;

                if (request.getIdUnidad() != null) {

                        unidad = unidadRepository.findById(
                                        request.getIdUnidad()).orElseThrow(
                                                        () -> new RecursoNoEncontradoException(
                                                                        "Unidad no encontrada"));

                        if (!unidad.getActivo()) {
                                throw new ReglaNegocioException(
                                                "No se puede asociar la ocurrencia a una unidad inactiva");
                        }
                }

                if (request.getIdRecurso() != null) {

                        recurso = recursoRepository.findById(
                                        request.getIdRecurso()).orElseThrow(
                                                        () -> new RecursoNoEncontradoException(
                                                                        "Recurso no encontrado"));

                        if (!recurso.getActivo()) {
                                throw new ReglaNegocioException(
                                                "No se puede asociar la ocurrencia a un recurso inactivo");
                        }
                }

                validarRelacionTipo(
                                request.getTipo(),
                                request.getIdUnidad(),
                                request.getIdRecurso());

                Ocurrencia ocurrencia = new Ocurrencia();

                ocurrencia.setFechaHora(LocalDateTime.now());
                ocurrencia.setTipo(request.getTipo());
                ocurrencia.setDescripcion(request.getDescripcion());
                ocurrencia.setInformante(informante);
                ocurrencia.setDestinatario(destinatario);
                ocurrencia.setUnidad(unidad);
                ocurrencia.setRecurso(recurso);
                ocurrencia.setLeida(false);

                Ocurrencia guardada = ocurrenciaRepository.save(ocurrencia);

                return convertirAResponse(guardada);
        }

        public List<OcurrenciaResponse> listar() {

                return ocurrenciaRepository.findAll()
                                .stream()
                                .map(this::convertirAResponse)
                                .toList();
        }

        public OcurrenciaResponse buscarPorId(Long id) {

                Ocurrencia ocurrencia = ocurrenciaRepository.findById(id)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Ocurrencia no encontrada"));

                return convertirAResponse(ocurrencia);
        }

        private void validarRelacionTipo(
                        TipoOcurrencia tipo,
                        Long idUnidad,
                        Long idRecurso) {

                if (tipo == TipoOcurrencia.GENERAL) {

                        if (idUnidad != null || idRecurso != null) {
                                throw new ReglaNegocioException(
                                                "Una ocurrencia GENERAL no puede estar asociada a una unidad o recurso");
                        }
                }

                if (tipo == TipoOcurrencia.UNIDAD) {

                        if (idUnidad == null || idRecurso != null) {
                                throw new ReglaNegocioException(
                                                "Una ocurrencia de tipo UNIDAD debe estar asociada a una unidad");
                        }
                }

                if (tipo == TipoOcurrencia.RECURSO) {

                        if (idRecurso == null || idUnidad != null) {
                                throw new ReglaNegocioException(
                                                "Una ocurrencia de tipo RECURSO debe estar asociada a un recurso");
                        }
                }
        }

        private Usuario obtenerUsuarioAutenticado() {

                Authentication authentication = SecurityContextHolder
                                .getContext()
                                .getAuthentication();

                String codigo = authentication.getName();

                return usuarioRepository.findByCodigo(codigo)
                                .orElseThrow(() -> new RecursoNoEncontradoException(
                                                "Usuario autenticado no encontrado"));
        }

        private OcurrenciaResponse convertirAResponse(
                        Ocurrencia ocurrencia) {

                OcurrenciaResponse response = new OcurrenciaResponse();

                response.setId(ocurrencia.getId());
                response.setFechaHora(ocurrencia.getFechaHora());
                response.setTipo(ocurrencia.getTipo());
                response.setDescripcion(ocurrencia.getDescripcion());
                response.setLeida(ocurrencia.getLeida());

                if (ocurrencia.getInformante() != null) {
                        response.setCodigoInformante(
                                        ocurrencia.getInformante().getCodigo());

                        response.setNombreInformante(
                                        ocurrencia.getInformante().getNombres()
                                                        + " "
                                                        + ocurrencia.getInformante().getApellidos());
                }

                if (ocurrencia.getDestinatario() != null) {
                        response.setCodigoDestinatario(
                                        ocurrencia.getDestinatario().getCodigo());

                        response.setNombreDestinatario(
                                        ocurrencia.getDestinatario().getNombres()
                                                        + " "
                                                        + ocurrencia.getDestinatario().getApellidos());
                }

                if (ocurrencia.getUnidad() != null) {
                        response.setIdUnidad(
                                        ocurrencia.getUnidad().getId());

                        response.setNombreUnidad(
                                        ocurrencia.getUnidad().getNombre());
                }

                if (ocurrencia.getRecurso() != null) {
                        response.setIdRecurso(
                                        ocurrencia.getRecurso().getId());

                        response.setCodigoRecurso(
                                        ocurrencia.getRecurso().getCodigo());
                }

                return response;
        }
}