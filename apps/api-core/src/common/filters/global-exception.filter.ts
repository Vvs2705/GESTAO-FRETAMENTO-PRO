import {
  Catch,
  type ArgumentsHost,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { trace, SpanStatusCode } from '@opentelemetry/api';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const span = trace.getActiveSpan();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Erro interno do servidor';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'object' && body !== null) {
        const bodyObj = body as Record<string, unknown>;
        code = (bodyObj['error'] as string) ?? exception.name;
        message = (bodyObj['message'] as string) ?? exception.message;
        details = bodyObj['details'] as Record<string, unknown> | undefined;
      } else {
        message = String(body);
        code = exception.name;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        { err: exception, path: request.url },
        'Unhandled exception',
      );
    }

    const traceId = span?.spanContext().traceId;

    span?.setStatus({ code: SpanStatusCode.ERROR, message });
    span?.recordException(
      exception instanceof Error ? exception : new Error(String(exception)),
    );

    const isProd = process.env['NODE_ENV'] === 'production';

    response.status(status).json({
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
        ...(traceId !== undefined && { traceId }),
        ...(!isProd && exception instanceof Error && { stack: exception.stack }),
      },
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
