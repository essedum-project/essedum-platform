import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone-peer-dep';

let exporter = new OTLPTraceExporter();
if (sessionStorage.getItem("telemetry") == "true") {
  exporter = new OTLPTraceExporter({
    url: sessionStorage.getItem("telemetryUrl") + '/api/v1/opentelemetry', // Replace with your OpenTelemetry Collector endpoint
  });
}

const provider: any = new WebTracerProvider();
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

provider.register({
  contextManager: new ZoneContextManager(),
});

export const tracer = provider.getTracer('telemetry-tracer');