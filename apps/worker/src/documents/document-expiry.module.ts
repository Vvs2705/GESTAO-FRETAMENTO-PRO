import { Module } from '@nestjs/common';
import { DocumentExpiryProcessor } from './document-expiry.processor';

@Module({
  providers: [DocumentExpiryProcessor],
})
export class DocumentExpiryModule {}
