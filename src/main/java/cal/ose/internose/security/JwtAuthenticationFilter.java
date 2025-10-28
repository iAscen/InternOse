package cal.ose.internose.security;


import cal.ose.internose.modele.User;
import cal.ose.internose.persistance.UserDAO;
import cal.ose.internose.security.exceptions.UserNotFoundException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final UserDAO userDAO;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, @Lazy UserDAO userDAO) {
        this.tokenProvider = tokenProvider;
        this.userDAO = userDAO;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws IOException, ServletException {
        String token = getJWTFromRequest(request);

        if (StringUtils.hasText(token)) {
            token = token.startsWith("Bearer") ? token.substring(7) : token;
            try {
                tokenProvider.verifyToken(token);
                String email = tokenProvider.getEmailFromJWT(token);
                User user = userDAO.findByCredentials_Email(email).orElseThrow(UserNotFoundException::new);
                UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                    user.getEmail(), null, user.getAuthorities()
                );
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            } catch (Exception e) {
                logger.error("Could not set user authentication in security context: ", e);
            }
        }
        filterChain.doFilter(request, response);
    }

    private String getJWTFromRequest(HttpServletRequest request) {
        return request.getHeader("Authorization");
    }
}
