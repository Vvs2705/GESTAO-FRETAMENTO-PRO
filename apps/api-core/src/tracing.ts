/**
 * tracing.ts
 * OpenTelemetry SDK bootstrap.
 * CRITICAL: This file MUST be imported as the FIRST line of main.ts,
 * before NestFactory and any other module that creates HTTP/DB connections.
 * This ensures all auto-instrumentations are registered before the first request.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';

const serviceName = process.env['OTEL_SERVICE_NAME'] ?? 'api-core';
const otlpEndpoint = process.env['OTEL_EXPORTER_OTLP_ENDPOINT'];

const sdk = new NodeSDK({
  serviceName,
  ...(otlpEndpoint && {
    traceExporter: new OTLPTraceExporter({ url: otlpEndpoint }),
  }),
  metricReader: new PrometheusExporter({ port: 9464 }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy/low-value instrumentations
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  void sdk
    .shutdown()
    .catch((err) => {
      console.error('Error shutting down OpenTelemetry SDK', err);
    })
    .finally(() => {
      process.exit(0);
    });
});

export { sdk };
