# 10 — Roadmap Competitivo (Fretamento)

> Derivado da análise competitiva (`analise-sites/projetos/gestao-fretamento/MELHORIAS.md`,
> 09/06/2026). Os itens abaixo são **produto/engenharia de maior porte** (backend,
> integrações, hardware) — fora do escopo da remediação de UX/acessibilidade desta
> entrega. Registrados aqui como backlog priorizado para as próximas fases.

## Posicionamento
> "A torre de controle da sua fretadora: operação, frota e financeiro em tempo
> real — sem a complexidade dos sistemas legados."

Grupo de concorrência: **ERP operacional de fretamento** (Cittati/ICS, OPR, TOTVS,
SORGES, Praxio), tocando a camada de **telemetria** (Cobli, Golfleet).

## Gaps priorizados (o que falta)

| # | Gap | Valor | Esforço | Depende de |
|---|-----|-------|---------|------------|
| 1 | **Rastreamento GPS ao vivo** no mapa da Torre Operacional (posição + aderência ao itinerário) | 🔴 Alto | Alto | Integração rastreador/app motorista, WebSocket, mapa real |
| 2 | **Emissão de CT-e OS** (Conhecimento de Transporte p/ fretamento) + contrato de fretamento | 🔴 Alto | Alto | SEFAZ, certificado A1, módulo fiscal |
| 3 | **Escala inteligente** de motoristas/veículos com regras de jornada (Lei do Motorista, descanso, conflito de alocação) | 🟠 Médio-alto | Médio | Engine de regras sobre `Trip`/`Driver` |
| 4 | **Telemetria / comportamento do motorista** (velocidade, frenagem, jornada) | 🟠 Médio | Alto | Hardware ou app do motorista |
| 5 | **Roteirização** de fretados (otimização de rota/itinerário) | 🟡 Médio | Médio | API de rotas/matriz de distância |
| 6 | **Manutenção preditiva + checklist** (pneus, OS de oficina) — aprofundar módulo existente | 🟡 Médio | Médio | Histórico de `MaintenanceOrder` |
| 7 | **App do motorista** (checklist, ocorrências, início/fim de viagem, comprovantes) | 🟠 Médio-alto | Alto | App mobile + endpoints |
| 8 | **Portal/cotação do cliente** (solicitar fretamento) — conectar `/cotacao` do site Vstack ao app | 🟡 Médio | Médio | Auth externa, fluxo de cotação |

## Diferenciais a explorar (onde ganhar)
- **Torre Operacional como centro de comando** — UX moderna superior aos legados (TOTVS/OPR datados).
- **Dashboard Executivo como BI do dono** — custo por km, ocupação, TCO, margem por viagem.
- **Gestão de Ocorrências de primeira classe** — diferencial de qualidade de serviço.
- **All-in-one sem hardware obrigatório** — integrar o rastreador que o cliente já tem.
- **Custo/UX para frotas pequenas e médias** — nicho mal atendido pelos ERPs robustos.

## A conferir dentro do app (antes de priorizar)
Validar o que já existe parcialmente em Torre Operacional / Viagens / Documentos:
rastreamento ao vivo, emissão de CT-e OS, escala com jornada, app do motorista.

## Fontes
Cittati/ICS, OPR Sistemas, TOTVS Transportes, SORGES, Cobli, Golfleet, Praxio — ver `MELHORIAS.md`.
