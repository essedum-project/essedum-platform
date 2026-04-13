package com.lfn.icip.vibecoding.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Thin relay service that proxies all requests to the Goose API service.
 * <p>
 * Each method forwards the request body (when applicable) to the corresponding
 * Goose endpoint and returns the response verbatim, preserving HTTP status codes.
 * SSE endpoints are streamed back as {@code Flux<String>} with raw event data.
 */
@Service
public class VibeCodingService {

    private static final Logger logger = LoggerFactory.getLogger(VibeCodingService.class);

    private final WebClient gooseWebClient;

    public VibeCodingService(@Qualifier("gooseWebClient") WebClient gooseWebClient) {
        this.gooseWebClient = gooseWebClient;
    }

    /**
     * Relays a POST request with a JSON body to Goose and returns the response.
     *
     * @param path Goose endpoint path
     * @param body request body (may be null for no-body POST endpoints)
     * @return relay of the Goose JSON response with its original status code
     */
    public Mono<ResponseEntity<String>> post(String path, Object body) {
        logger.debug("Goose POST {}", path);
        var spec = gooseWebClient.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON);
        var request = (body != null)
                ? spec.bodyValue(body)
                : spec.bodyValue("");
        return request
                .exchangeToMono(response -> response.toEntity(String.class))
                .doOnError(ex -> logger.error("Goose POST {} error: {}", path, ex.getMessage()))
                .onErrorResume(WebClientResponseException.class, ex ->
                        Mono.just(ResponseEntity.status(ex.getStatusCode())
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(ex.getResponseBodyAsString())))
                .onErrorResume(ex ->
                        Mono.just(ResponseEntity.internalServerError()
                                .contentType(MediaType.APPLICATION_JSON)
                                .body("{\"error\":\"" + sanitize(ex.getMessage()) + "\"}")));
    }

    /**
     * Relays a GET request to Goose, forwarding optional query parameters.
     *
     * @param path        Goose endpoint path
     * @param queryParams optional query parameters to forward
     * @return relay of the Goose JSON response with its original status code
     */
    public Mono<ResponseEntity<String>> get(String path, MultiValueMap<String, String> queryParams) {
        logger.debug("Goose GET {}", path);
        return gooseWebClient.get()
                .uri(uriBuilder -> {
                    var b = uriBuilder.path(path);
                    if (queryParams != null && !queryParams.isEmpty()) {
                        b.queryParams(queryParams);
                    }
                    return b.build();
                })
                .exchangeToMono(response -> response.toEntity(String.class))
                .doOnError(ex -> logger.error("Goose GET {} error: {}", path, ex.getMessage()))
                .onErrorResume(WebClientResponseException.class, ex ->
                        Mono.just(ResponseEntity.status(ex.getStatusCode())
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(ex.getResponseBodyAsString())))
                .onErrorResume(ex ->
                        Mono.just(ResponseEntity.internalServerError()
                                .contentType(MediaType.APPLICATION_JSON)
                                .body("{\"error\":\"" + sanitize(ex.getMessage()) + "\"}")));
    }

    /**
     * Relays a PUT request with a JSON body to Goose.
     *
     * @param path Goose endpoint path
     * @param body request body
     * @return relay of the Goose JSON response with its original status code
     */
    public Mono<ResponseEntity<String>> put(String path, Object body) {
        logger.debug("Goose PUT {}", path);
        var spec = gooseWebClient.put()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON);
        var request = (body != null)
                ? spec.bodyValue(body)
                : spec.bodyValue("");
        return request
                .exchangeToMono(response -> response.toEntity(String.class))
                .doOnError(ex -> logger.error("Goose PUT {} error: {}", path, ex.getMessage()))
                .onErrorResume(WebClientResponseException.class, ex ->
                        Mono.just(ResponseEntity.status(ex.getStatusCode())
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(ex.getResponseBodyAsString())))
                .onErrorResume(ex ->
                        Mono.just(ResponseEntity.internalServerError()
                                .contentType(MediaType.APPLICATION_JSON)
                                .body("{\"error\":\"" + sanitize(ex.getMessage()) + "\"}")));
    }

    /**
     * Relays a DELETE request to Goose.
     *
     * @param path Goose endpoint path
     * @return relay of the Goose response (no body) with its original status code
     */
    public Mono<ResponseEntity<Void>> delete(String path) {
        logger.debug("Goose DELETE {}", path);
        return gooseWebClient.delete()
                .uri(path)
                .exchangeToMono(response -> response.toBodilessEntity())
                .doOnError(ex -> logger.error("Goose DELETE {} error: {}", path, ex.getMessage()))
                .onErrorResume(WebClientResponseException.class, ex ->
                        Mono.just(ResponseEntity.<Void>status(ex.getStatusCode()).build()))
                .onErrorResume(ex ->
                        Mono.just(ResponseEntity.<Void>internalServerError().build()));
    }

    /**
     * Relays a POST request to Goose and streams the SSE response back.
     * <p>
     * Used for {@code POST /reply} which returns a stream of {@code MessageEvent} lines.
     *
     * @param path Goose SSE endpoint path
     * @param body request body
     * @return Flux of raw SSE lines streamed from Goose
     */
    public Flux<String> ssePost(String path, Object body) {
        logger.debug("Goose SSE POST {}", path);
        var spec = gooseWebClient.post()
                .uri(path)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM);
        var request = (body != null)
                ? spec.bodyValue(body)
                : spec.bodyValue("");
        return request
                .retrieve()
                .bodyToFlux(String.class)
                .doOnError(ex -> logger.error("Goose SSE POST {} error: {}", path, ex.getMessage()))
                .onErrorResume(ex ->
                        Flux.just("data: {\"type\":\"error\",\"message\":\"" + sanitize(ex.getMessage()) + "\"}\n\n"));
    }

    /**
     * Relays a GET request to Goose and streams the SSE response back.
     * <p>
     * Used for {@code GET /sessions/{id}/events}.
     *
     * @param path Goose SSE endpoint path
     * @return Flux of raw SSE lines streamed from Goose
     */
    public Flux<String> sseGet(String path) {
        logger.debug("Goose SSE GET {}", path);
        return gooseWebClient.get()
                .uri(path)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(String.class)
                .doOnError(ex -> logger.error("Goose SSE GET {} error: {}", path, ex.getMessage()))
                .onErrorResume(ex ->
                        Flux.just("data: {\"type\":\"error\",\"message\":\"" + sanitize(ex.getMessage()) + "\"}\n\n"));
    }

    private static String sanitize(String msg) {
        if (msg == null) return "unknown error";
        return msg.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}

