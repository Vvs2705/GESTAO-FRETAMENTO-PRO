# 🚌 GESTÃO-FRETAMENTO-PRO — SETUP DE SESSÃO (transporte/fretamento)

> **Instrução para o agente:** Sistema de gestão de fretamento — o diferencial competitivo aqui é o domínio de TRANSPORTE no Brasil: documentos fiscais de transporte (MDF-e/CT-e), rotas, frota e contratos. Execute em ordem, loop fechado. Pré-requisito: `00_VSTACK_BASE_SETUP.md` aplicado.

## Contexto
- Stack: FastAPI + PostgreSQL / Next.js + TypeScript + Tailwind
- Domínio: fretamento → viagens, veículos, motoristas, contratos, e potencialmente documentos fiscais de transporte

## FASE 1 — Diagnóstico
1. Leia o repositório e o `CLAUDE.md` (crie se não existir).
2. Mapeie o modelo de domínio atual: entidades de viagem/veículo/motorista/cliente existem? Testes?
3. Verifique sobreposição com o erp-projeto — módulos genéricos (auth, RBAC, multi-tenant) devem seguir os MESMOS padrões dele, não reinventar.

✅ Verificar: mapa do domínio salvo em `docs/dominio.md`.

## FASE 2 — Stack fiscal de transporte (diferencial do produto)
O MDF-e é obrigatório no transporte intermunicipal de mercadorias, e a `nfelib` mantém bindings atualizados para MDF-e e CT-e gerados dos XSDs da Fazenda:

```bash
pip install nfelib          # bindings MDF-e, CT-e (e NF-e se precisar)
pip install erpbrasil.edoc  # transmissão SEFAZ
```

Integração:
- Crie módulo `app/transporte_fiscal/` isolando a lib atrás de interface própria.
- Avalie com o Vinicius: fretamento de PASSAGEIROS pode envolver BP-e (bilhete de passagem eletrônico) — a nfelib também tem bindings. Confirme o escopo antes de implementar.
- Certificado A1 fora do repo, via env/secret.

✅ Verificar: teste gerando um MDF-e de exemplo, serializando e re-parseando sem erro.

## FASE 3 — Fundações compartilhadas
1. Reaproveite do erp-projeto: padrão de auth, RBAC e multi-tenancy (mesma dependency de escopo de tenant).
2. Migrations Alembic reproduzíveis do zero.

✅ Verificar: teste de isolamento entre tenants passando.

## FASE 4 — MCP de banco (dev)
```bash
claude mcp add --scope project postgres -- npx @henkey/postgres-mcp-server --connection-string "postgresql://mcp_readonly:SENHA@localhost:5432/fretamento_dev"
```
✅ Verificar: agente lista e descreve as tabelas.

## FASE 5 — Frontend V-STACK
1. `npx shadcn@latest add @github/Vvs2705/vstack-registry/design-conventions`
2. Telas típicas do domínio (agenda de viagens, mapa de frota, contratos): montar com componentes do vstack-registry; extrair de volta para o registry o que for reutilizável (ex.: componente de agenda/calendário).

✅ Verificar: layout base renderizando com componentes do registry.

## FASE 6 — Qualidade e registro
1. `/ponytail-review` antes de commits grandes.
2. Action `anthropics/claude-code-security-review` em `.github/workflows/`.
3. Atualize o `CLAUDE.md`: módulo `transporte_fiscal/`, decisão MDF-e/CT-e/BP-e, padrões herdados do erp-projeto, tooling ativo.

## Checklist final
- [ ] Mapa de domínio documentado
- [ ] nfelib com MDF-e testado (e escopo BP-e decidido)
- [ ] Fundações multi-tenant alinhadas ao erp-projeto
- [ ] MCP Postgres read-only ativo
- [ ] Frontend consumindo vstack-registry
- [ ] CLAUDE.md atualizado
