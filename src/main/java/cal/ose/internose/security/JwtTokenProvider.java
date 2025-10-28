package cal.ose.internose.security;

import cal.ose.internose.security.exceptions.InvalidJwtTokenException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {
    @Value("${application.security.jwt.expiration}")
    private int jwtExpirationMillis;
    @Value("${application.security.jwt.secret-key}")
    private String jwtSecret = "2B7E151628AED2A6ABF7158809CF4F3C2B7E151628AED2A6ABF7158809CF4F3C";

    public void generateToken(Authentication authentication) {
        long nowMillis = System.currentTimeMillis();
        JwtBuilder builder = Jwts.builder()
            .setSubject(authentication.getName())
            .setIssuedAt(new Date(nowMillis))
            .setExpiration(new Date(nowMillis + jwtExpirationMillis))
            .claim("authorities", authentication.getAuthorities())
            .signWith(key());
        builder.compact();
    }

    public String generateToken(Authentication authentication, Long id, String firstName, String lastName) {
        long nowMillis = System.currentTimeMillis();
        JwtBuilder builder = Jwts.builder()
            .setSubject(authentication.getName())
            .setIssuedAt(new Date(nowMillis))
            .setExpiration(new Date(nowMillis + jwtExpirationMillis))
            .claim("authorities", authentication.getAuthorities())
            .claim("id", id)
            .claim("firstName", firstName)
            .claim("lastName", lastName)
            .signWith(key());
        return builder.compact();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getEmailFromJWT(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    public Long getIDFromJWT(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(key())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get("id", Long.class);
    }

    public void verifyToken(String token) throws InvalidJwtTokenException {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
        } catch (SecurityException ex) {
            throw new InvalidJwtTokenException(HttpStatus.BAD_REQUEST, "Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            throw new InvalidJwtTokenException(HttpStatus.BAD_REQUEST, "Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            throw new InvalidJwtTokenException(HttpStatus.BAD_REQUEST, "Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            throw new InvalidJwtTokenException(HttpStatus.BAD_REQUEST, "Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            throw new InvalidJwtTokenException(HttpStatus.BAD_REQUEST, "JWT claims string is empty");
        }
    }
}
