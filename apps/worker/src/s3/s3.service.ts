import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Env } from '@gestao-fretamento-pro/config';

/**
 * S3Service — armazenamento de objetos compatível com AWS S3 e MinIO.
 *
 * Configuração via env (packages/config):
 *   - S3_BUCKET            nome do bucket (obrigatório para upload)
 *   - S3_REGION            região (default us-east-1)
 *   - S3_ACCESS_KEY_ID     credencial
 *   - S3_SECRET_ACCESS_KEY credencial
 *   - S3_ENDPOINT          endpoint S3-compatível (MinIO). Vazio = AWS S3.
 *
 * Se as credenciais/bucket não estiverem configurados, `isConfigured()` retorna
 * false e os consumidores degradam graciosamente (sem quebrar o worker).
 */
@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly bucket: string | undefined;
  private readonly client: S3Client | null;

  constructor(private readonly config: ConfigService<Env>) {
    this.bucket = this.config.get('S3_BUCKET');
    const accessKeyId = this.config.get('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get('S3_SECRET_ACCESS_KEY');
    const region = this.config.get('S3_REGION') ?? 'us-east-1';
    const endpoint = this.config.get('S3_ENDPOINT');

    if (this.bucket && accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region,
        ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
        credentials: { accessKeyId, secretAccessKey },
      });
      this.logger.log(
        `S3 configurado (bucket=${this.bucket}${endpoint ? `, endpoint=${endpoint}` : ''})`,
      );
    } else {
      this.client = null;
      this.logger.warn(
        'S3 não configurado — uploads serão ignorados. Defina S3_BUCKET/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY.',
      );
    }
  }

  /** Indica se o storage está pronto para uso. */
  isConfigured(): boolean {
    return this.client !== null && Boolean(this.bucket);
  }

  /** Faz upload de um buffer e retorna a key armazenada. */
  async uploadBuffer(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    if (!this.client || !this.bucket) {
      throw new Error('S3 não está configurado — não é possível fazer upload.');
    }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    this.logger.debug(`Upload concluído: ${key} (${body.length} bytes)`);
    return key;
  }

  /** Gera uma URL assinada de download com expiração (default 1h). */
  async getSignedDownloadUrl(
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    if (!this.client || !this.bucket) {
      throw new Error('S3 não está configurado — não é possível gerar URL.');
    }
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSeconds },
    );
  }
}
