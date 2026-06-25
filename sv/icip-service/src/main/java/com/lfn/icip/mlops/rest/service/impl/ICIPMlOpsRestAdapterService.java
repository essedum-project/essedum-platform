package com.lfn.icip.mlops.rest.service.impl;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpDelete;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestBase;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.lfn.icip.dataset.constants.ICIPPluginConstants;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedModelsRepository;
import com.lfn.icip.icipwebeditor.service.IICIPMLFederatedModelService;

@Service
public class ICIPMlOpsRestAdapterService {

    /**
     * The essedum url.
     */
    @Value("${ESSEDUM_URL}")
    private String referer;

    /**
     * The icip pathPrefix.
     */
    @Value("${icip.pathPrefix}")
    private String icipPathPrefix;

    @Autowired
    private ICIPDatasetPluginsService pluginService;

    @Autowired
    private IICIPMLFederatedModelService fedModelService;

    @Autowired
    private IICIPDatasourceService datasourceService;

    @Autowired
    private ICIPMLFederatedModelsRepository fedModelRepo;

    /**
     * The Constant logger.
     */
    private static final Logger logger = LoggerFactory.getLogger(ICIPMlOpsRestAdapterService.class);

    // Java
    public String callGetMethod(String adaptername, String methodname, String org,
                                Map<String, String> headers,
                                Map<String, String> params)
            throws ClientProtocolException, IOException, URISyntaxException,
            NoSuchAlgorithmException, KeyStoreException, KeyManagementException {

        long startTs = System.currentTimeMillis();
        logger.info("callGetMethod start adapter={} method={} org={} headerCount={} paramCount={}",
                adaptername, methodname, org,
                headers != null ? headers.size() : 0,
                params != null ? params.size() : 0);

        String host = getHostFromHeader(headers);

        logger.info("Host : {}", host);

        if (host == null || host.isEmpty()) {
            host = referer;
            logger.info("Using referer fallback host={}", host);
        } else {
            logger.info("Host from headers host={}", host);
        }

        SSLContextBuilder builder = new SSLContextBuilder();
        builder.loadTrustMaterial(null, (X509Certificate[] chain, String authType) -> true);
        SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
        CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();

        HttpGet httpGet = new HttpGet(buildAdapterUri(host, adaptername, methodname, org));

        if (headers != null) {
            headers.forEach((k, v) -> {
                httpGet.addHeader(k, v);
                logger.info("Added header {}={}", k, v);
            });
        }

        applyEssedumHeaders(host, httpGet);

        List<NameValuePair> nvpList = new ArrayList<>(params != null ? params.size() : 0);
        if (params != null) {
            params.forEach((k, v) -> {
                nvpList.add(new BasicNameValuePair(k, v));
                logger.info("Added param {}={}", k, v);
            });
        }

        URI paramsUri = new URIBuilder(httpGet.getURI()).addParameters(nvpList).build();
        httpGet.setURI(paramsUri);
        logger.info("Final GET URI={}", paramsUri);

        try (var response = httpClient.execute(httpGet)) {
            int status = response.getStatusLine().getStatusCode();
            String body = EntityUtils.toString(response.getEntity());
            long elapsed = System.currentTimeMillis() - startTs;
            logger.info("callGetMethod success status={} elapsedMs={}", status, elapsed);
            logger.info("Response body (truncated to 500 chars): {}",
                    body.length() > 500 ? body.substring(0, 500) + "..." : body);
            return body;
        } catch (IOException e) {
            long elapsed = System.currentTimeMillis() - startTs;
            logger.error("callGetMethod failure elapsedMs={} error={}", elapsed, e.getMessage(), e);
            throw e;
        }
    }

    public String callPostMethod(String adaptername, String methodname, String org, Map<String, String> headers,
                                 Map<String, String> params, String body) throws ClientProtocolException, IOException, URISyntaxException,
            NoSuchAlgorithmException, KeyStoreException, KeyManagementException {

        long startTs = System.currentTimeMillis();
        logger.info("callPostMethod start adapter={} method={} org={} headerCount={} paramCount={}",
                adaptername, methodname, org,
                headers != null ? headers.size() : 0,
                params != null ? params.size() : 0);

        String host = getHostFromHeader(headers);
        logger.info("Host : {}", host);

        if (host == null || host.isEmpty()) {
            /* Taking LEAP URL Path as host if referer is not present in the headers */
            host = referer;
            logger.info("Using referer fallback host={}", host);
        } else {
            logger.info("Host from headers host={}", host);
        }

        SSLContextBuilder builder = new SSLContextBuilder();
        builder.loadTrustMaterial(null, (X509Certificate[] chain, String authType) -> true);
        SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
        CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();

        HttpPost httpPost = new HttpPost(buildAdapterUri(host, adaptername, methodname, org));

        if (headers != null) {
            headers.forEach((k, v) -> {
                if (!"Content-Length".equalsIgnoreCase(k)) {
                    httpPost.addHeader(k, v);
                    logger.info("Added header {}={}", k, v);
                }
            });
        }

        applyEssedumHeaders(host, httpPost);

        List<NameValuePair> nvpList = new ArrayList<>(params != null ? params.size() : 0);
        if (params != null) {
            params.forEach((k, v) -> {
                nvpList.add(new BasicNameValuePair(k, v));
                logger.info("Added param {}={}", k, v);
            });
        }

        URI paramsUri = new URIBuilder(httpPost.getURI()).addParameters(nvpList).build();
        httpPost.setURI(paramsUri);
        logger.info("Final POST URI={}", paramsUri);

        HttpEntity bodyEntity = new StringEntity(body);
        httpPost.setEntity(bodyEntity);

        try (var response = httpClient.execute(httpPost)) {
            int status = response.getStatusLine().getStatusCode();
            String responseBody = EntityUtils.toString(response.getEntity());
            long elapsed = System.currentTimeMillis() - startTs;
            logger.info("callPostMethod success status={} elapsedMs={}", status, elapsed);
            logger.info("Response body (truncated to 500 chars): {}",
                    responseBody.length() > 500 ? responseBody.substring(0, 500) + "..." : responseBody);
            return responseBody;
        } catch (IOException e) {
            long elapsed = System.currentTimeMillis() - startTs;
            logger.error("callPostMethod failure elapsedMs={} error={}", elapsed, e.getMessage(), e);
            throw e;
        }
    }

    public String callDeleteMethod(String adaptername, String methodname, String org, Map<String, String> headers,
                                   Map<String, String> params) throws ClientProtocolException, IOException, URISyntaxException,
            NoSuchAlgorithmException, KeyStoreException, KeyManagementException {

        long startTs = System.currentTimeMillis();
        logger.info("callDeleteMethod start adapter={} method={} org={} headerCount={} paramCount={}",
                adaptername, methodname, org,
                headers != null ? headers.size() : 0,
                params != null ? params.size() : 0);

        String host = getHostFromHeader(headers);
        logger.info("Host : {}", host);

        if (host == null || host.isEmpty()) {
            /* Taking LEAP URL Path as host if referer is not present in the headers */
            host = referer;
            logger.info("Using referer fallback host={}", host);
        } else {
            logger.info("Host from headers host={}", host);
        }

        SSLContextBuilder builder = new SSLContextBuilder();
        builder.loadTrustMaterial(null, (X509Certificate[] chain, String authType) -> true);
        SSLConnectionSocketFactory sslsf = new SSLConnectionSocketFactory(builder.build());
        CloseableHttpClient httpClient = HttpClients.custom().setSSLSocketFactory(sslsf).build();

        HttpDelete httpDelete = new HttpDelete(buildAdapterUri(host, adaptername, methodname, org));

        if (headers != null) {
            headers.forEach((k, v) -> {
                httpDelete.addHeader(k, v);
                logger.info("Added header {}={}", k, v);
            });
        }

        applyEssedumHeaders(host, httpDelete);

        List<NameValuePair> nvpList = new ArrayList<>(params != null ? params.size() : 0);
        if (params != null) {
            params.forEach((k, v) -> {
                nvpList.add(new BasicNameValuePair(k, v));
                logger.info("Added param {}={}", k, v);
            });
        }

        URI paramsUri = new URIBuilder(httpDelete.getURI()).addParameters(nvpList).build();
        httpDelete.setURI(paramsUri);
        logger.info("Final DELETE URI={}", paramsUri);

        try (var response = httpClient.execute(httpDelete)) {
            int status = response.getStatusLine().getStatusCode();
            String body = EntityUtils.toString(response.getEntity());
            long elapsed = System.currentTimeMillis() - startTs;
            logger.info("callDeleteMethod success status={} elapsedMs={}", status, elapsed);
            logger.info("Response body (truncated to 500 chars): {}",
                    body.length() > 500 ? body.substring(0, 500) + "..." : body);
            return body;
        } catch (IOException e) {
            long elapsed = System.currentTimeMillis() - startTs;
            logger.error("callDeleteMethod failure elapsedMs={} error={}", elapsed, e.getMessage(), e);
            throw e;
        }
    }

    private static void applyEssedumHeaders(String host, HttpRequestBase httpRequest) {
        if (!host.contains("localhost")) {
            // Replace access-token header with the provided value
            Header existingAccessToken = httpRequest.getFirstHeader("access-token");
            if (existingAccessToken != null) {
                httpRequest.removeHeaders("access-token");
                logger.info("Removed existing access-token header (old value: {})", existingAccessToken.getValue());
            }
            httpRequest.addHeader("access-token", "aec127c2-c984-33f6-9a3a-355xd1dof097");
            logger.info("Added access-token header for remote host: {}", host);

            // Remove authorization header if present (not needed for remote Essedum hosts)
            Header authHeader = httpRequest.getFirstHeader("authorization");
            if (authHeader != null) {
                httpRequest.removeHeaders("authorization");
                logger.info("Removed authorization header for remote host: {}", host);
            }

            // Update host header to match the target host
            Header hostHeader = httpRequest.getFirstHeader("host");
            String targetHost = URI.create(host).getHost();
            if (hostHeader != null) {
                httpRequest.removeHeader(hostHeader);
            }
            httpRequest.addHeader("host", targetHost);
            logger.info("Set host header to: {}", targetHost);

            logger.info("Remote host detected: {}. Headers configured.", host);
        } else {
            logger.info("Localhost detected: {}. Skipping Essedum-specific headers.", host);
        }
    }

    private String getHostFromHeader(Map<String, String> headers) {
        String hostFromHeader = null;
        hostFromHeader = headers.get(ICIPPluginConstants.REFERER_TITLE_CASE);
        if (hostFromHeader == null || hostFromHeader.isEmpty()) {
            hostFromHeader = headers.get(ICIPPluginConstants.REFERER_LOWER_CASE);
        }
        return hostFromHeader;
    }

    /**
     * Validates the {@code host} value (taken from request headers or configuration) against
     * the trusted {@code referer} configured for this service, ensuring that only requests
     * targeted at the configured Essedum back-end host are issued. This prevents
     * Server-Side Request Forgery (SSRF) where an attacker-controlled Referer header could
     * otherwise direct outbound HTTP requests to arbitrary internal or external hosts.
     *
     * @param host the candidate host (scheme + authority, possibly with path)
     * @return the validated host string
     * @throws IllegalArgumentException if the host is malformed or not allowlisted
     */
    private String validateHost(String host) {
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("Host must not be null or empty");
        }
        URI candidate;
        try {
            candidate = URI.create(host);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid host URI: " + host, ex);
        }
        String scheme = candidate.getScheme();
        String authority = candidate.getHost();
        if (scheme == null || !(scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))
                || authority == null || authority.isBlank()) {
            throw new IllegalArgumentException("Host must be an http(s) URL with a valid authority: " + host);
        }
        // Only allow the configured referer's host (or localhost for local development)
        String allowedHost;
        try {
            allowedHost = URI.create(referer).getHost();
        } catch (Exception ex) {
            throw new IllegalArgumentException("Configured referer is invalid", ex);
        }
        if (!"localhost".equalsIgnoreCase(authority)
                && !"127.0.0.1".equals(authority)
                && (allowedHost == null || !allowedHost.equalsIgnoreCase(authority))) {
            throw new IllegalArgumentException(
                    "Host not in allowlist (expected '" + allowedHost + "' or localhost): " + authority);
        }
        return host;
    }

    /**
     * Builds the adapter target URI in an SSRF-safe way: the host is validated against
     * an allowlist and each user-controlled path segment is added through {@link URIBuilder}
     * so it is percent-encoded and cannot inject additional path/query components.
     */
    private URI buildAdapterUri(String host, String adaptername, String methodname, String org)
            throws URISyntaxException {
        String safeHost = validateHost(host);
        URIBuilder builder = new URIBuilder(safeHost + icipPathPrefix);
        // Use setPathSegments so each segment is encoded individually (no '/', '?', '#' smuggling).
        builder.setPathSegments(
                concatSegments(builder.getPathSegments(),
                        "adapters", safeSegment(adaptername), safeSegment(methodname), safeSegment(org)));
        return builder.build();
    }

    private static List<String> concatSegments(List<String> existing, String... extra) {
        List<String> all = new ArrayList<>();
        if (existing != null) {
            for (String s : existing) {
                if (s != null && !s.isEmpty()) {
                    all.add(s);
                }
            }
        }
        for (String s : extra) {
            all.add(s);
        }
        return all;
    }

    private static String safeSegment(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Path segment must not be null");
        }
        // Reject path/query/fragment separators outright.
        if (value.indexOf('/') >= 0 || value.indexOf('\\') >= 0
                || value.indexOf('?') >= 0 || value.indexOf('#') >= 0
                || value.indexOf('\n') >= 0 || value.indexOf('\r') >= 0) {
            throw new IllegalArgumentException("Invalid characters in path segment: " + value);
        }
        return value;
    }

    public ResponseEntity<?> getS3FileData(String modelName, String fileName, String org) {
        try {
            ICIPDataset datasetForModel = new ICIPDataset();
            ICIPDatasource datasource = new ICIPDatasource();
            List<ICIPMLFederatedModel> iCIPMLFederatedModels = fedModelRepo.getModelByModelNameAndOrganisation(modelName, org);
            ICIPMLFederatedModel iCIPMLFederatedModel = iCIPMLFederatedModels.getFirst();
            datasource = datasourceService.getDatasource(iCIPMLFederatedModel.getDatasource(), org);
            datasetForModel.setDatasource(datasource);
            datasetForModel.setOrganization(org);
            datasetForModel.setAttributes(iCIPMLFederatedModel.getAttributes());
            return new ResponseEntity<>(pluginService.getS3FileData(datasetForModel, fileName), new HttpHeaders(),
                    HttpStatus.OK);
        } catch (Exception e) {
            logger.error("EXCEPTION:", e);
            return new ResponseEntity<>("Request failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<byte[]> getS3FileDataAsBytes(String modelName, String fileName, String org) {
        try {
            ICIPDataset datasetForModel = new ICIPDataset();
            ICIPDatasource datasource = new ICIPDatasource();
            List<ICIPMLFederatedModel> iCIPMLFederatedModels = fedModelRepo.getModelByModelNameAndOrganisation(modelName, org);
            ICIPMLFederatedModel iCIPMLFederatedModel = iCIPMLFederatedModels.getFirst();
            datasource = datasourceService.getDatasource(iCIPMLFederatedModel.getDatasource(), org);
            datasetForModel.setDatasource(datasource);
            datasetForModel.setOrganization(org);
            datasetForModel.setAttributes(iCIPMLFederatedModel.getAttributes());

            // Get raw file bytes directly from S3
            byte[] fileBytes = pluginService.getS3FileDataAsBytes(datasetForModel, fileName);

            // Set proper headers for binary download
            HttpHeaders headers = new HttpHeaders();

            // Set Content-Type using MediaType constant - MUST be octet-stream for binary
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentLength(fileBytes.length);
            headers.set("Accept-Ranges", "bytes");  // Enable range requests for binary files

            // Set Content-Disposition with exact filename (no modification)
            // Use URL encoding for special characters
            String urlEncodedFileName = java.net.URLEncoder.encode(fileName, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "%20");
            headers.set(HttpHeaders.CONTENT_DISPOSITION,
                String.format("attachment; filename*=UTF-8''%s", urlEncodedFileName));

            // Add cache control to prevent caching issues
            headers.setCacheControl("no-cache, no-store, must-revalidate");
            headers.setPragma("no-cache");
            headers.setExpires(0);

            // Add custom header with original filename for debugging
            headers.set("X-Original-Filename", fileName);

            logger.info("Returning raw file bytes for: {} (size: {} bytes, Content-Type: {})",
                fileName, fileBytes.length, MediaType.APPLICATION_OCTET_STREAM);

            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("EXCEPTION:", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> uploadModel(ICIPMLFederatedModel requestBody, String fileUploaded) {
        try {
            ICIPDataset datasetForModel = new ICIPDataset();
            ICIPDatasource datasource = datasourceService.getDatasource(requestBody.getDatasource(),
                    requestBody.getOrganisation());
            datasetForModel.setDatasource(datasource);
            datasetForModel.setOrganization(requestBody.getOrganisation());
            datasetForModel.setAttributes(requestBody.getAttributes());
            Boolean fileAttached = false;
            List<Object> data = new ArrayList<>();
            if (fileUploaded != null && !fileUploaded.isBlank()) {
                try {
                    data = pluginService.getS3FileData(datasetForModel, fileUploaded);
                    fileAttached = true;
                } catch (Exception exc) {
                    return new ResponseEntity<>("FAILED", HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }

            if (!fileAttached || data.get(0) == null) {
                Boolean testSuccess = false;
                try {
                    testSuccess = pluginService.getDataSetService(datasetForModel).testConnection(datasetForModel);
                } catch (Exception e) {
                    return new ResponseEntity<>("FAILED", HttpStatus.INTERNAL_SERVER_ERROR);
                }
                if (testSuccess)
                    return new ResponseEntity<>("SUCCESS", new HttpHeaders(), HttpStatus.OK);
                else
                    return new ResponseEntity<>("FAILED", HttpStatus.INTERNAL_SERVER_ERROR);
            } else {
                return new ResponseEntity<>(
                        "Model already present in the specified path, Please upload a different file",
                        HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("EXCEPTION:", e);
            return new ResponseEntity<>("Request failed", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
