import type { Locale } from './profile';
const repositories = ['open-speech-bridge', 'database-radar', 'rizoma', 'legacy-flight-recorder'];
export const projectNames = [
  'OpenSpeechBridge',
  'Database Radar',
  'Rizoma',
  'Legacy Flight Recorder',
];
const shared = [
  {
    mode: 'audio',
    category: 'LOCAL-FIRST AUDIO RUNTIME',
    tech: 'Rust / PipeWire / Ring buffers / Engine protocols',
    docs: 'docs/ARCHITECTURE.md',
  },
  {
    mode: 'radar',
    category: 'STATIC SYSTEMS INTELLIGENCE',
    tech: 'Java / Static analysis / SQL parsing / Evidence graphs',
    docs: 'docs/analysis-model.md',
  },
  {
    mode: 'mapping',
    category: 'SAFE DATA INTEGRATION',
    tech: 'Java / Streaming ingestion / Profiling / Deterministic mapping',
    docs: 'docs/CONSUMING_RIZOMA.md',
  },
  {
    mode: 'trace',
    category: 'RUNTIME EVIDENCE',
    tech: 'Java 8 / Bytecode instrumentation / JDBC / JSONL',
    docs: 'docs/architecture.md',
  },
];
const descriptions = {
  pt: [
    {
      title: 'Sua voz. Outro idioma.\nSob seu controle.',
      status: 'Desenvolvimento inicial',
      problem:
        'Conversas desktop atravessam idiomas, mas tradução de voz costuma depender de serviços externos e integrações fechadas.',
      idea: 'Separar o runtime de áudio dos modelos. Uma arquitetura local-first com buffers limitados e engines substituíveis conecta microfone físico, processamento e saída virtual.',
      evidence:
        'Tipos de áudio, ring buffers, protocolos de engines e estrutura de CLI implementados. Fundação modular em Rust.',
      limits:
        'Captura PipeWire e microfone virtual ainda em construção. STT, tradução, TTS e o fluxo completo são etapas futuras.',
    },
    {
      title: 'Antes de mudar uma coluna,\nentenda o impacto.',
      status: 'MVP / v0.1',
      problem:
        'Em um sistema legado, uma alteração de banco pode atingir fluxos que ninguém mais conhece por completo.',
      idea: 'Investigar o código sem compilá-lo ou executá-lo. Conectar métodos, SQL, tabelas e colunas em um grafo de evidências com arquivo, linha e confiança.',
      evidence:
        'CLI offline para JDBC, arquivos SQL, JPA básico e chamadas diretas. Consultas de leitura, escrita e impacto com exportação JSON.',
      limits:
        'SQL dinâmico, reflexão e dependências não resolvidas permanecem incertos. Evidência estática não representa toda execução possível.',
    },
    {
      title: 'Importar dados exige\nmais do que ler colunas.',
      status: 'Em desenvolvimento / 0.6 SNAPSHOT',
      problem:
        'Planilhas variam. Um mapeamento silenciosamente errado transforma uma importação simples em risco operacional.',
      idea: 'Perfilar os dados, explicar cada sugestão e pedir confirmação quando a evidência é insuficiente. Validar a transformação antes de qualquer integração.',
      evidence:
        'CSV, XLS e XLSX; profiling, mapeamento explicável, feedback explícito, layouts conhecidos e dry-run com histórico determinístico.',
      limits:
        'Não escreve no destino. Scores são heurísticos, não probabilidades. A biblioteca ainda não foi publicada como release.',
    },
    {
      title: 'O que realmente\naconteceu nesta execução?',
      status: 'Experimental / pré-release',
      problem:
        'Aplicações Java 8 acopladas nem sempre podem ser modificadas apenas para explicar um fluxo em produção.',
      idea: 'Um Java Agent de escopo limitado registra métodos e JDBC localmente. A análise posterior separa o que foi observado, inferido ou ficou desconhecido.',
      evidence:
        'Árvore de chamadas, eventos JDBC e JSONL limitado. Verificação documentada em Temurin 8/Linux e fixture H2.',
      limits:
        'Não qualificado para produção. Correlação na mesma thread; outros drivers, servidores e plataformas ainda precisam de validação.',
    },
  ],
  en: [
    {
      title: 'Your voice. Another language.\nUnder your control.',
      status: 'Early development',
      problem:
        'Desktop conversations cross languages, but voice translation often relies on external services and closed integrations.',
      idea: 'Separate the audio runtime from the models. A local-first architecture with bounded buffers and replaceable engines connects a physical microphone, processing and virtual output.',
      evidence:
        'Audio types, ring buffers, engine protocols and CLI structure implemented. A modular Rust foundation.',
      limits:
        'PipeWire capture and virtual microphone are still being built. STT, translation, TTS and the complete pipeline are future milestones.',
    },
    {
      title: 'Before changing a column,\nunderstand the impact.',
      status: 'MVP / v0.1',
      problem:
        'In legacy software, a database change can affect workflows that nobody fully understands anymore.',
      idea: 'Investigate source without compiling or running it. Connect methods, SQL, tables and columns in an evidence graph with file, line and confidence.',
      evidence:
        'Offline CLI for JDBC, SQL files, basic JPA and direct calls. Reader, writer and impact queries with JSON export.',
      limits:
        'Dynamic SQL, reflection and unresolved dependencies remain uncertain. Static evidence does not describe every possible execution.',
    },
    {
      title: 'Importing data takes\nmore than reading columns.',
      status: 'In development / 0.6 SNAPSHOT',
      problem:
        'Spreadsheets vary. A silently incorrect mapping can turn a simple import into an operational risk.',
      idea: 'Profile data, explain each suggestion and require confirmation when evidence is insufficient. Validate the transformation before integration.',
      evidence:
        'CSV, XLS and XLSX; profiling, explainable mapping, explicit feedback, known layouts and dry-run with deterministic history.',
      limits:
        'No destination writes. Scores are heuristics, not probabilities. The library has not been published as a release.',
    },
    {
      title: 'What actually happened\nin this execution?',
      status: 'Experimental / pre-release',
      problem:
        'Coupled Java 8 applications cannot always be modified just to explain a runtime workflow.',
      idea: 'A narrowly scoped Java agent records methods and JDBC locally. Later analysis separates observed events, inferences and unknowns.',
      evidence:
        'Call trees, JDBC events and bounded JSONL. Documented verification on Temurin 8/Linux with an H2 fixture.',
      limits:
        'Not production-qualified. Same-thread correlation; other drivers, servers and platforms need validation.',
    },
  ],
};
export function projects(locale: Locale) {
  return shared.map((s, i) => ({
    ...s,
    ...descriptions[locale][i],
    name: projectNames[i],
    id: repositories[i],
    url: `https://github.com/felipemacedo1/${repositories[i]}`,
  }));
}
