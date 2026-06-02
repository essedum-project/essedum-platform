package com.lfn.gateway.security;

import java.security.Key;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

/**
 * Lightweight JWT utility for the API Gateway.
 * Validates JWT tokens using the same HMAC-SHA512 secret as downstream services.
 * Does NOT perform authorization — only authentication (token validity).
 */
@Component
public class JwtUtil implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.base64-secret}")
    private String base64Secret;

    private Key key;

    @Override
    public void afterPropertiesSet() {
        byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Validates the given JWT token.
     *
     * @param token the JWT token string (without "Bearer " prefix)
     * @return true if the token signature and expiry are valid
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token is malformed: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token is unsupported: {}", e.getMessage());
        } catch (SignatureException e) {
            log.warn("JWT token signature is invalid: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT token is empty or null: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Extracts the subject (username) from a valid JWT token.
     *
     * @param token the JWT token string
     * @return the subject claim
     */
    public String getSubject(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        return claims.getSubject();
    }

    /**
     * Extracts the authorities claim from the token.
     *
     * @param token the JWT token string
     * @return the "auth" claim value
     */
    public String getAuthorities(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
        Object auth = claims.get("auth");
        return auth != null ? auth.toString() : "";
    }
}

