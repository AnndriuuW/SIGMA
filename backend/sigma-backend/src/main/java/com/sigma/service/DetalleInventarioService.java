package com.sigma.service;

import com.sigma.dto.DetalleInventarioCreateRequest;
import com.sigma.dto.DetalleInventarioResponse;
import com.sigma.dto.DetalleInventarioUpdateRequest;
import com.sigma.entity.DetalleInventario;
import com.sigma.entity.Inventario;
import com.sigma.entity.Recurso;
import com.sigma.entity.Usuario;
import com.sigma.repository.DetalleInventarioRepository;
import com.sigma.repository.InventarioRepository;
import com.sigma.repository.RecursoRepository;
import com.sigma.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.sigma.exception.RecursoNoEncontradoException;
import com.sigma.dto.OcurrenciaCreateRequest;
import com.sigma.entity.TipoOcurrencia;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DetalleInventarioService {

        private final DetalleInventarioRepository detalleInventarioRepository;
        private final InventarioRepository inventarioRepository;
        private final RecursoRepository recursoRepository;
        private final UsuarioRepository usuarioRepository;
        private final OcurrenciaService ocurrenciaService;

        public DetalleInventarioService(
                        DetalleInventarioRepository detalleInventarioRepository,
                        InventarioRepository inventarioRepository,
                        RecursoRepository recursoRepository,
                        UsuarioRepository usuarioRepository,
                        OcurrenciaService ocurrenciaService) {

                this.detalleInventarioRepository = detalleInventarioRepository;
                this.inventarioRepository = inventarioRepository;
                this.recursoRepository = recursoRepository;
                this.usuarioRepository = usuarioRepository;
                this.ocurrenciaService = ocurrenciaService;
        }

        public DetalleInventarioResponse crear(DetalleInventarioCreateRequest request) {

                Inventario inventario = inventarioRepository.findById(request.getIdInventario())
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException("Inventario no encontrado"));

                Recurso recurso = recursoRepository.findById(request.getIdRecurso())
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException("Recurso no encontrado"));

                Usuario usuarioVerificador = obtenerUsuarioAutenticado();

                DetalleInventario detalle = new DetalleInventario();

                detalle.setInventario(inventario);
                detalle.setRecurso(recurso);
                detalle.setVerificado(request.getVerificado());
                detalle.setVerificadoPor(usuarioVerificador);
                detalle.setFechaVerificacion(LocalDateTime.now());
                detalle.setObservacion(request.getObservacion());

                DetalleInventario guardado = detalleInventarioRepository.save(detalle);

                if (!request.getVerificado()) {

                        Usuario jefeMaquinas = usuarioRepository
                                .findFirstByRolNombreAndActivoTrue("JEFE_MAQUINAS")
                                .orElseThrow(() ->
                                        new RecursoNoEncontradoException(
                                                "No existe un Jefe de Máquinas activo"));

                        OcurrenciaCreateRequest ocurrenciaRequest =
                                new OcurrenciaCreateRequest();

                        ocurrenciaRequest.setTipo(TipoOcurrencia.RECURSO);

                        ocurrenciaRequest.setDescripcion(
                                "Novedad detectada durante inventario: el recurso "
                                        + recurso.getCodigo()
                                        + " - "
                                        + recurso.getNombre()
                                        + " no fue verificado."
                        );

                        ocurrenciaRequest.setCodigoDestinatario(
                                jefeMaquinas.getCodigo()
                        );

                        ocurrenciaRequest.setIdRecurso(
                                recurso.getId()
                        );

                        ocurrenciaService.crear(ocurrenciaRequest);
                }

                return convertirRespuesta(guardado);
        }

        public List<DetalleInventarioResponse> listar() {

                return detalleInventarioRepository.findAll()
                                .stream()
                                .map(this::convertirRespuesta)
                                .toList();
        }

        public DetalleInventarioResponse buscarPorId(Long id) {

                DetalleInventario detalle = detalleInventarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Detalle de inventario no encontrado"));

                return convertirRespuesta(detalle);
        }

        public DetalleInventarioResponse actualizar(
                        Long id,
                        DetalleInventarioUpdateRequest request) {

                DetalleInventario detalle = detalleInventarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Detalle de inventario no encontrado"));

                Usuario usuarioVerificador = obtenerUsuarioAutenticado();

                detalle.setVerificado(request.getVerificado());
                detalle.setVerificadoPor(usuarioVerificador);
                detalle.setFechaVerificacion(LocalDateTime.now());
                detalle.setObservacion(request.getObservacion());

                DetalleInventario actualizado = detalleInventarioRepository.save(detalle);

                return convertirRespuesta(actualizado);
        }

        private Usuario obtenerUsuarioAutenticado() {

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new RuntimeException("Usuario no autenticado");
                }

                String codigo = authentication.getName();

                return usuarioRepository.findByCodigo(codigo)
                                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
        }

        private DetalleInventarioResponse convertirRespuesta(
                        DetalleInventario detalle) {

                DetalleInventarioResponse response = new DetalleInventarioResponse();

                response.setId(detalle.getId());
                response.setIdInventario(detalle.getInventario().getId());
                response.setIdRecurso(detalle.getRecurso().getId());
                response.setCodigoRecurso(detalle.getRecurso().getCodigo());
                response.setNombreRecurso(detalle.getRecurso().getNombre());

                if (detalle.getVerificadoPor() != null) {
                        response.setCodigoVerificadoPor(
                                        detalle.getVerificadoPor().getCodigo());

                        response.setNombreVerificadoPor(
                                        detalle.getVerificadoPor().getNombres()
                                                        + " "
                                                        + detalle.getVerificadoPor().getApellidos());
                }

                response.setVerificado(detalle.getVerificado());
                response.setFechaVerificacion(detalle.getFechaVerificacion());
                response.setObservacion(detalle.getObservacion());

                return response;
        }
}