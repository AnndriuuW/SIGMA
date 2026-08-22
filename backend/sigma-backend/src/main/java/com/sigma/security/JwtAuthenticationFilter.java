package com.sigma.security;

import com.sigma.service.JwtService;
import com.sigma.service.UsuarioDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

        private final JwtService jwtService;
        private final UsuarioDetailsService usuarioDetailsService;

        public JwtAuthenticationFilter(
                        JwtService jwtService,
                        UsuarioDetailsService usuarioDetailsService) {

                this.jwtService = jwtService;
                this.usuarioDetailsService = usuarioDetailsService;
        }

        @Override
        protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain)
                        throws ServletException, IOException {

                String authorizationHeader = request.getHeader("Authorization");
                if (authorizationHeader == null ||
                                !authorizationHeader.startsWith("Bearer ")) {

                        filterChain.doFilter(request, response);
                        return;
                }

                String token = authorizationHeader.substring(7);

                try {

                        String codigo = jwtService.extraerCodigo(token);

                        if (codigo != null &&
                                        SecurityContextHolder.getContext().getAuthentication() == null) {

                                UserDetails usuarioDetails = usuarioDetailsService.loadUserByUsername(codigo);

                                if (jwtService.esTokenValido(token, usuarioDetails)) {

                                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                                        usuarioDetails,
                                                        null,
                                                        usuarioDetails.getAuthorities());

                                        authentication.setDetails(
                                                        new WebAuthenticationDetailsSource()
                                                                        .buildDetails(request));

                                        SecurityContextHolder.getContext()
                                                        .setAuthentication(authentication);
                                }
                        }

                } catch (Exception e) {
                        // Token inválido: continúa sin autenticar
                }

                filterChain.doFilter(request, response);
                filterChain.doFilter(request, response);
        }
}
