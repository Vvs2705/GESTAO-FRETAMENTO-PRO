import { Global, Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';

/**
 * Módulo global de serviços transversais. Provê o `AuditService` (trilha de
 * auditoria imutável) para toda a aplicação — vários módulos de domínio (fuel,
 * finance, etc.) injetam o AuditService e antes precisavam declará-lo nos seus
 * próprios `providers`, o que ficava inconsistente e quebrava o bootstrap
 * quando esquecido. Sendo @Global, o AuditService fica disponível em qualquer
 * módulo sem reimportação. Depende apenas do PrismaService (também global).
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class CommonModule {}
