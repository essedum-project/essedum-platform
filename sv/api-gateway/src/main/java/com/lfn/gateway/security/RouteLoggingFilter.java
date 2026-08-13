package com.lfn.gateway.security;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Logs every routed request through the gateway.
 */
@Component
public class RouteLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RouteLoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        Optional.ofNullable((Route) exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR))
                .ifPresentOrElse(
                        route -> log.info(">>> ROUTE MATCHED: path='{}' -> routeId='{}', uri='{}'",
                                path, route.getId(), route.getUri()),
                        () -> log.warn(">>> NO ROUTE MATCHED for path='{}'", path));
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -50; // After JWT filter (-100), before other filters
    }
}

