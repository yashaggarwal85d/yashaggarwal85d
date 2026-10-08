// All copy on the site comes from Yash's resume. Edit here, not in components.

import { tr } from './i18n';

export const profile = {
  name: 'Yash Aggarwal',
  firstName: 'Yash',
  initials: 'YA',
  role: tr('Data Engineer'),
  company: 'Texas Instruments',
  location: tr('Bangalore, India'),
  email: 'yashaggarwal85d@gmail.com',
  linkedin: 'https://www.linkedin.com/in/yashaggarwal85d/',
  github: 'https://github.com/yashaggarwal85d',
  tagline:
    tr('Data Engineer building the batch and streaming platforms behind semiconductor manufacturing and supply-chain planning.'),
  summary:
    tr('Data Engineer with 3+ years at Texas Instruments, building the batch and streaming data platforms behind semiconductor manufacturing and supply-chain planning. Hands-on with Python, SQL, PySpark, Kafka and Airflow at multi-terabyte scale, lakehouse modelling (Iceberg, Data Vault 2.0) and CI/CD on Kubernetes.'),
  availability: tr('Ready to relocate · notice period 1–2 months · English (fluent)'),
};

export const education = {
  school: 'Thapar Institute of Engineering and Technology',
  place: tr('Patiala, India'),
  degree: tr('B.E. in Computer Science & Engineering'),
  grade: tr('CGPA 9.07 / 10'),
  period: '2019 – 2023',
};

export type Job = {
  period: string;
  title: string;
  company: string;
  place: string;
  icon: 'server' | 'workflow' | 'code';
  color: string;
  blurb?: string;
  points: string[];
  tags: string[];
};

export const experience: Job[] = [
  {
    period: tr('Feb 2025 – Present'),
    title: tr('Data Engineer II'),
    company: 'Texas Instruments',
    place: tr('Bangalore, India'),
    icon: 'server',
    color: '#b8612f',
    blurb:
      tr('Supply Chain & Manufacturing IT: data platforms for demand, supply and factory operations.'),
    points: [
      tr('Cut the nightly supply-planning run from ~18h to ~45min (24×), so planners can replan intra-day, by driving the data-engineering track of a 20-engineer programme that rebuilt monolithic cron jobs as distributed PySpark services.'),
      tr('Raised per-node ingest throughput 3.8× over the previous Spark jobs (1.5 GB/s on identical hardware) by building a Rust-based ETL engine that now lands ~16 TB/day of factory and operational data.'),
      tr('Designed Data Vault 2.0 models on an Iceberg/ClickHouse lakehouse growing by ~6 PB/year, giving planners, yield and logistics teams one governed source for cross-application analytics.'),
      tr('Streamed MES and ERP data from sites worldwide into the operational stores behind planning and factory applications at sub-second p95 latency, owning Kafka ingestion with S3/Iceberg as the raw landing zone.'),
      tr('Took supply-chain rule changes from a ~2-week release cycle to same-day, with a full audit trail, by building a rule-orchestration platform with automated validation and staged rollouts.'),
      tr('Merged 136 site-level databases into one distributed YugabyteDB cluster behind a unified Python/FastAPI layer, giving every site a single source of truth for production data.'),
      tr('Designed the concurrent production-start planning engine that turns business rules and ML demand signals into 64-week factory build plans for every site.'),
    ],
    tags: ['PySpark', 'Rust', 'Kafka', 'Iceberg', 'ClickHouse', 'YugabyteDB', 'FastAPI'],
  },
  {
    period: tr('Jun 2023 – Feb 2025'),
    title: tr('Data Engineer'),
    company: 'Texas Instruments',
    place: tr('Bangalore, India'),
    icon: 'workflow',
    color: '#d49a57',
    points: [
      tr('Eliminated ~150 manual planner overrides per week and improved on-time fulfilment across 70K+ SKUs by fixing the fab-to-assembly start-signal logic behind a systemic under-build.'),
      tr('Reduced production Spark runtimes by 30–80% through partitioning, skew and memory tuning; brought a legacy multi-model forecasting pipeline from 24h to under 7h.'),
      tr('Let planners rerun forecast cycles on demand by productionising the Python demand-forecasting pipeline on Airflow, Spark and Oracle with modular data flows.'),
      tr('Prepared production databases for a projected 2× load increase through capacity sizing, SQL tuning and on-call incident ownership; mentored 2 junior engineers and 3 interns.'),
    ],
    tags: ['Spark', 'Airflow', 'Oracle', 'Python', 'SQL tuning'],
  },
  {
    period: tr('Jan 2023 – Jun 2023'),
    title: tr('Software Development Intern'),
    company: 'Texas Instruments',
    place: tr('Bangalore, India'),
    icon: 'code',
    color: '#5a4032',
    points: [
      tr('Built and launched an internal election platform for 10K+ employees, with hierarchical authorisation.'),
    ],
    tags: ['Web platform', 'AuthZ'],
  },
];

export type SkillGroup =
  | 'Languages'
  | 'Processing'
  | 'Lakehouse'
  | 'Databases'
  | 'Cloud & IaC'
  | 'DevOps'
  | 'AI';

export type Skill = {
  name: string;
  group: SkillGroup;
  /** simple-icons export name, e.g. "siPython" */
  icon?: string;
  /** fallback lettermark when no brand icon exists */
  mark?: string;
  color?: string;
};

export const skills: Skill[] = [
  { name: 'Python', group: 'Languages', icon: 'siPython' },
  { name: 'SQL', group: 'Languages', mark: 'SQL', color: '#b8612f' },
  { name: 'Rust', group: 'Languages', icon: 'siRust' },
  { name: 'Java', group: 'Languages', icon: 'siOpenjdk' },

  { name: 'PySpark', group: 'Processing', icon: 'siApachespark' },
  { name: 'Spark SQL', group: 'Processing', icon: 'siApachespark' },
  { name: 'Kafka', group: 'Processing', icon: 'siApachekafka' },
  { name: 'Flink', group: 'Processing', icon: 'siApacheflink' },
  { name: 'Airflow', group: 'Processing', icon: 'siApacheairflow' },
  { name: 'dbt', group: 'Processing', icon: 'siDbt' },
  { name: 'Data Quality', group: 'Processing', mark: 'DQ', color: '#5a4032' },

  { name: 'Apache Iceberg', group: 'Lakehouse', mark: 'ICE', color: '#8b7766' },
  { name: 'Delta Lake', group: 'Lakehouse', mark: 'Δ', color: '#00add4' },
  { name: 'Databricks', group: 'Lakehouse', icon: 'siDatabricks' },
  { name: 'ClickHouse', group: 'Lakehouse', icon: 'siClickhouse' },
  { name: 'Data Vault 2.0', group: 'Lakehouse', mark: 'DV', color: '#8e2f2a' },
  { name: 'Dimensional', group: 'Lakehouse', mark: '★', color: '#d49a57' },

  { name: 'PostgreSQL', group: 'Databases', icon: 'siPostgresql' },
  { name: 'Oracle', group: 'Databases', mark: 'ORA', color: '#f80000' },
  { name: 'YugabyteDB', group: 'Databases', mark: 'YB', color: '#ff6e42' },
  { name: 'MySQL', group: 'Databases', icon: 'siMysql' },
  { name: 'Redis', group: 'Databases', icon: 'siRedis' },
  { name: 'Snowflake', group: 'Databases', icon: 'siSnowflake' },

  { name: 'AWS', group: 'Cloud & IaC', icon: 'siAmazonwebservices' },
  { name: 'S3 · EMR · Glue', group: 'Cloud & IaC', icon: 'siAmazons3' },
  { name: 'Azure', group: 'Cloud & IaC', mark: 'AZ', color: '#0089d6' },
  { name: 'ADF · ADLS Gen2', group: 'Cloud & IaC', mark: 'ADF', color: '#0089d6' },
  { name: 'Terraform', group: 'Cloud & IaC', icon: 'siTerraform' },

  { name: 'Kubernetes', group: 'DevOps', icon: 'siKubernetes' },
  { name: 'Docker', group: 'DevOps', icon: 'siDocker' },
  { name: 'Jenkins', group: 'DevOps', icon: 'siJenkins' },
  { name: 'ArgoCD', group: 'DevOps', icon: 'siArgo' },
  { name: 'Git', group: 'DevOps', icon: 'siGit' },
  { name: 'Prometheus', group: 'DevOps', icon: 'siPrometheus' },
  { name: 'Grafana', group: 'DevOps', icon: 'siGrafana' },

  { name: 'AI agents', group: 'AI', mark: 'AGT', color: '#b8612f' },
  { name: 'Model inference', group: 'AI', mark: 'INF', color: '#d49a57' },
  { name: 'LLM tooling', group: 'AI', mark: 'LLM', color: '#5a4032' },
];

export type Work = {
  category: string;
  period: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  /** optional before/after comparison, same unit */
  compare?: { before: number; after: number; beforeLabel: string; afterLabel: string };
  gradient: [string, string];
  tags: string[];
};

export const work: Work[] = [
  {
    category: tr('Batch platform'),
    period: tr('2025 – Now'),
    title: tr('Supply-Plan Re-platform'),
    description:
      tr('Drove the data-engineering track of a 20-engineer programme that rebuilt monolithic cron jobs as distributed PySpark services, so planners can replan intra-day.'),
    metric: '24×',
    metricLabel: tr('faster nightly supply-planning run'),
    compare: { before: 18, after: 0.75, beforeLabel: '~18h', afterLabel: '~45min' },
    gradient: ['#b8612f', '#8e2f2a'],
    tags: ['PySpark', 'Distributed services', 'Planning'],
  },
  {
    category: tr('Ingestion engine'),
    period: tr('2025 – Now'),
    title: tr('Rust ETL Engine'),
    description:
      tr('A Rust-based ETL engine that lands ~16 TB/day of factory and operational data at 1.5 GB/s per node on identical hardware.'),
    metric: '3.8×',
    metricLabel: tr('per-node throughput vs. previous Spark jobs'),
    compare: { before: 1, after: 3.8, beforeLabel: 'Spark', afterLabel: 'Rust · 1.5 GB/s' },
    gradient: ['#d49a57', '#b8612f'],
    tags: ['Rust', 'ETL', '16 TB/day'],
  },
  {
    category: tr('Lakehouse'),
    period: tr('2025 – Now'),
    title: tr('Governed Lakehouse'),
    description:
      tr('Data Vault 2.0 models on an Iceberg/ClickHouse lakehouse: one governed source for planners, yield and logistics teams.'),
    metric: '~6 PB',
    metricLabel: tr('of new data every year'),
    gradient: ['#5a4032', '#2a1d16'],
    tags: ['Iceberg', 'ClickHouse', 'Data Vault 2.0'],
  },
  {
    category: tr('Streaming'),
    period: tr('2025 – Now'),
    title: tr('Global MES & ERP Streams'),
    description:
      tr('Owns Kafka ingestion from sites worldwide into the operational stores behind planning and factory apps, with S3/Iceberg as the raw landing zone.'),
    metric: '<1s',
    metricLabel: tr('p95 latency, site to operational store'),
    gradient: ['#c8ac8c', '#8b7766'],
    tags: ['Kafka', 'S3', 'Iceberg'],
  },
  {
    category: tr('Platform'),
    period: tr('2025 – Now'),
    title: tr('Rule Orchestration'),
    description:
      tr('Automated validation and staged rollouts for supply-chain business rules, with a full audit trail on every change.'),
    metric: tr('Same day'),
    metricLabel: tr('rule releases, down from a ~2-week cycle'),
    compare: { before: 14, after: 1, beforeLabel: tr('~2 weeks'), afterLabel: tr('same day') },
    gradient: ['#8e2f2a', '#5a4032'],
    tags: ['Python', 'Validation', 'Staged rollouts'],
  },
  {
    category: tr('Distributed DB'),
    period: tr('2025 – Now'),
    title: tr('Site DB Consolidation'),
    description:
      tr('Merged every site-level database into one distributed YugabyteDB cluster behind a unified Python/FastAPI layer.'),
    metric: '136 → 1',
    metricLabel: tr('single source of truth for production data'),
    gradient: ['#d49a57', '#8e2f2a'],
    tags: ['YugabyteDB', 'FastAPI', 'Python'],
  },
  {
    category: tr('Planning engine'),
    period: tr('2025 – Now'),
    title: tr('Production-Start Planner'),
    description:
      tr('A concurrent engine that turns business rules and ML demand signals into factory build plans for every site.'),
    metric: tr('64 wks'),
    metricLabel: tr('of build plans, generated per site'),
    gradient: ['#3b2a21', '#b8612f'],
    tags: ['Concurrency', 'ML signals', 'Planning'],
  },
  {
    category: tr('Algorithms'),
    period: '2023 – 2025',
    title: tr('Start-Signal Fix'),
    description:
      tr('Fixed the fab-to-assembly start-signal logic behind a systemic under-build, improving on-time fulfilment across 70K+ SKUs.'),
    metric: '~150',
    metricLabel: tr('manual planner overrides removed every week'),
    gradient: ['#b8612f', '#d49a57'],
    tags: ['Supply chain', 'SQL', 'Python'],
  },
];

export const achievements = [
  {
    title: tr('Technical Presentation to Global IT Leadership'),
    org: tr('Texas Instruments HQ, Dallas'),
    date: tr('Aug 2026'),
    icon: 'presentation',
    color: '#b8612f',
    text: tr('Selected by the Director of IT to present the Rust ETL architecture; its benchmarks became the reference for TI’s global data pipelines.'),
  },
  {
    title: tr('Winner, TI India ITS Tech Hackathon'),
    org: 'Texas Instruments',
    date: '2024',
    icon: 'trophy',
    color: '#d49a57',
    text: tr('Led the team that built an AI-optimised supply-chain simulator.'),
  },
  {
    title: tr('Star of the Quarter Award'),
    org: 'Texas Instruments',
    date: tr('Q4 2024'),
    icon: 'star',
    color: '#8e2f2a',
    text: tr('Recognised for planning algorithms and mentorship.'),
  },
  {
    title: tr('CGPA 9.07 / 10'),
    org: 'Thapar Institute of Engineering and Technology',
    date: '2019 – 2023',
    icon: 'grad',
    color: '#5a4032',
    text: tr('B.E. in Computer Science & Engineering.'),
  },
] as const;

export type SectionLink = { id: string; label: string; nav: boolean; group?: string };

/** Page order. Sections without `nav` light up the nav item they sit under. */
export const sections: SectionLink[] = [
  { id: 'reel', label: tr('Intro'), nav: true },
  { id: 'numbers', label: tr('Numbers'), nav: true },
  { id: 'about', label: tr('About'), nav: false, group: 'numbers' },
  { id: 'experience', label: tr('Experience'), nav: true },
  { id: 'work', label: tr('Work'), nav: true },
  { id: 'skills', label: tr('Skills'), nav: false, group: 'work' },
  { id: 'off-the-clock', label: tr('Off the clock'), nav: true },
  { id: 'achievements', label: tr('Awards'), nav: false, group: 'off-the-clock' },
  { id: 'contact', label: tr('Contact'), nav: true },
];

export type Numeral = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
  note: string;
  tone: 'espresso' | 'caramel' | 'foam' | 'cinnamon' | 'crema' | 'roast' | 'oat';
};

// The reel's numbers, slowed down (W2). The first one gets the big card.
export const numbers: Numeral[] = [
  { value: 24, suffix: '×', label: tr('Supply-plan run'), note: tr('~18h → ~45min, so planners replan intra-day'), tone: 'espresso' },
  { value: 16, suffix: ' TB', label: tr('Landed / day'), note: tr('factory & operational data, via a Rust ETL engine'), tone: 'caramel' },
  { value: 136, suffix: '→1', label: tr('Databases'), note: tr('site DBs merged into one YugabyteDB cluster'), tone: 'foam' },
  { value: 3.8, decimals: 1, suffix: '×', label: tr('Rust vs Spark'), note: tr('per-node ingest, 1.5 GB/s on identical hardware'), tone: 'cinnamon' },
  { value: 6, prefix: '~', suffix: ' PB', label: tr('New data / year'), note: tr('Data Vault 2.0 on an Iceberg/ClickHouse lakehouse'), tone: 'crema' },
  { value: 1, prefix: '<', suffix: 's', label: tr('p95 latency'), note: tr('MES & ERP streams from sites worldwide'), tone: 'roast' },
  { value: 70, suffix: 'K+', label: tr('SKUs'), note: tr('on-time fulfilment improved'), tone: 'oat' },
  { value: 150, prefix: '−', suffix: '', label: tr('Overrides / week'), note: tr('manual planner fixes eliminated'), tone: 'oat' },
  { value: 64, suffix: ' wks', label: tr('Build plans'), note: tr('factory plans for every site, from one engine'), tone: 'oat' },
];

export type Film = { title: string; kind: 'Series' | 'Film' | 'Anime' | 'Books' | 'Music' | 'Travel' | 'Kitchen'; take: string; spine: string; ink: string };

// Edit the takes freely: they are meant to sound like you.
export const films: Film[] = [
  { title: 'Dexter', kind: 'Series', take: tr('Methodical, rule-bound, terrifyingly organised. Basically a well-run pipeline.'), spine: '#8e2f2a', ink: '#fbf7ef' },
  { title: 'Interstellar', kind: 'Film', take: tr('Relativity as a plot device and a gut punch. The docking scene lives rent-free.'), spine: '#120c09', ink: '#d49a57' },
  { title: 'Inception', kind: 'Film', take: tr('The top was still spinning. I’m choosing to believe it fell.'), spine: '#f3eadb', ink: '#17100c' },
  { title: 'Re:Zero', kind: 'Anime', take: tr('Return by Death is retry-with-backoff, with much worse consequences.'), spine: '#e9d9bf', ink: '#17100c' },
  { title: 'Harry Potter', kind: 'Film', take: tr('Always. Seven books, eight films, zero regrets.'), spine: '#2a1d16', ink: '#d49a57' },
  { title: 'The Hobbit', kind: 'Film', take: tr('There and back again: the original long-running job that finished.'), spine: '#3f5a3a', ink: '#f3eadb' },
  { title: 'Star Wars', kind: 'Film', take: tr('A long time ago, in a galaxy far, far away… still the best opening crawl.'), spine: '#0d0806', ink: '#fbf7ef' },
  { title: tr('Books'), kind: 'Books', take: tr('Always one more chapter than I planned. Bookmarks are a suggestion.'), spine: '#3b2a21', ink: '#e9d9bf' },
  { title: tr('Piano'), kind: 'Music', take: tr('Keys after dark. Chords first, scales eventually.'), spine: '#0d0806', ink: '#c8ac8c' },
  { title: tr('Travelling'), kind: 'Travel', take: tr('Window seat, always. Every new city is an unexplored dataset.'), spine: '#d49a57', ink: '#17100c' },
  { title: tr('Cooking'), kind: 'Kitchen', take: tr('No recipe, all taste. Mise en place is just good data hygiene.'), spine: '#b8612f', ink: '#fbf7ef' },
];

export const euler: Record<string, string> = {
  e: tr('e ≈ 2.718, the base of natural growth: what continuous compounding converges to.'),
  i: tr('i = √−1. Multiplying by i rotates a number a quarter-turn in the complex plane.'),
  π: tr('π ≈ 3.14159, half a turn in radians. So e^{iπ} is a half-turn from 1, landing on −1.'),
  1: tr('1, the multiplicative identity. Add it to e^{iπ} and you are back at…'),
  0: tr('0, the additive identity. Five fundamental constants, one line.'),
};
