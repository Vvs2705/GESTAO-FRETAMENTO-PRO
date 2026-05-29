import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: process.env['OTEL_SERVICE_NAME'] ?? 'worker',
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  void sdk
    .shutdown()
    .catch(() => {
      // Ignora erros de shutdown durante o encerramento
    })
    .finally(() => {
      process.exit(0);
    });
});

export { sdk };
