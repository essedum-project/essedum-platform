package com.lfn.icip.icipwebeditor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Binds pipeline metadata validation rules from application.yml.
 *
 * <pre>
 * pipeline:
 *   metadata:
 *     validation:
 *       application:
 *         allowed-frameworks: [reactjs, streamlit]
 *       agent:
 *         allowed-frameworks: [langgraph, google-adk]
 *       mcp:
 *         required-server-framework: fastapi
 *         required-protocols: [http-stream, sse]
 * </pre>
 */
@Component
@ConfigurationProperties(prefix = "pipeline.metadata.validation")
@Data
public class PipelineMetadataConfig {


    private ApplicationValidationConfig application = new ApplicationValidationConfig();
    private AgentValidationConfig agent = new AgentValidationConfig();
    private McpValidationConfig mcp = new McpValidationConfig();

    @Data
    public static class ApplicationValidationConfig {
        private List<String> allowedFrameworks = new ArrayList<>();
    }

    @Data
    public static class AgentValidationConfig {
        private List<String> allowedFrameworks = new ArrayList<>();
    }

    @Data
    public static class McpValidationConfig {
        private String requiredServerFramework;
        private List<String> requiredProtocols = new ArrayList<>();
    }
}
