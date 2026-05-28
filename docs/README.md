# APP EXCLUSIVA — Blueprint de Produção Escalável

Este pacote organiza a base de produção do sistema em arquivos separados por área. A visão deixa de ser apenas um MVP simples e passa a ser uma fundação de produto SaaS B2B escalável para empresas de transporte, fretamento, turismo, eventos, logística de colaboradores e operações corporativas.

## Objetivo

Criar uma plataforma de gestão operacional com padrão profissional, preparada para:

- centralizar informações que hoje ficam em WhatsApp, planilhas e controles informais;
- organizar acesso por cargo, área, filial e nível hierárquico;
- entregar dashboards executivos e operacionais de alto nível;
- controlar viagens, frota, motoristas, passageiros, abastecimento, manutenção, ocorrências, documentos, contratos e indicadores;
- começar como MVP validável dentro da Exclusiva Turismo;
- evoluir para produto comercial para empresas do interior e, depois, operações maiores.

## Arquivos deste pacote

1. `00-manifesto-qualidade-produto.md`
2. `01-decisao-stack-tecnologica.md`
3. `02-arquitetura-produto-escalavel.md`
4. `03-dominios-modulos-negocio.md`
5. `04-cargos-permissoes-dashboards.md`
6. `05-ux-ui-design-system-dashboard.md`
7. `06-backend-api-integracoes-eventos.md`
8. `07-dados-banco-analytics-bi.md`
9. `08-seguranca-lgpd-governanca.md`
10. `09-devops-infra-observabilidade.md`
11. `10-qa-testes-release-qualidade.md`
12. `11-roadmap-execucao-90-180-365.md`
13. `12-briefing-apresentacao-dono-equipe.md`

## Decisão central

A stack recomendada para o core é:

- Frontend web: **Next.js + React + TypeScript**
- Backend core: **NestJS + TypeScript**
- Banco principal: **PostgreSQL**
- Geodados: **PostGIS**
- Cache, sessões, filas rápidas e tempo real auxiliar: **Redis**
- IA, análise e modelos: **Python + FastAPI**
- Mobile: **React Native + Expo**, a partir da fase 2
- Infraestrutura: **Docker desde o primeiro dia; Kubernetes quando houver escala real**
- Arquitetura: **monorepo modular orientado a domínios**, preparado para extração futura em serviços

## Referências de mercado e tecnologia

As decisões foram orientadas por fontes públicas atuais:

- Stack Overflow Developer Survey 2025: https://survey.stackoverflow.co/2025/technology
- GitHub Octoverse 2025: https://octoverse.github.com/
- State of JavaScript 2025: https://2025.stateofjs.com/en-US/usage/
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
- PostgreSQL: https://www.postgresql.org/
- PostGIS: https://postgis.net/
- Kubernetes: https://kubernetes.io/
- NestJS: https://nestjs.com/
- Next.js: https://nextjs.org/
- React Native: https://reactnative.dev/
- FastAPI: https://fastapi.tiangolo.com/
- ANPD Guia Segurança: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte
- LGPD Lei 13.709: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
