package com.sigma.service;

import com.sigma.security.UsuarioDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration) {

        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expiration = expiration;
    }

    public String generarToken(UsuarioDetails usuarioDetails) {

        Date ahora = new Date();
        Date expiracion = new Date(
                ahora.getTime() + expiration
        );

        return Jwts.builder()
                .subject(usuarioDetails.getUsername())
                .claim(
                        "rol",
                        usuarioDetails.getAuthorities()
                                .iterator()
                                .next()
                                .getAuthority()
                )
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(secretKey)
                .compact();
    }

    public String extraerCodigo(String token) {

        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    public boolean esTokenValido(
            String token,
            UserDetails usuarioDetails) {

        try {

            String codigo = extraerCodigo(token);

            return codigo.equals(usuarioDetails.getUsername());

        } catch (Exception e) {

            return false;
        }
    }
}