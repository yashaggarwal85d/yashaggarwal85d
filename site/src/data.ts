// All copy on the site comes from Yash's resume. Edit here, not in components.

import { num, tr } from './i18n';

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
    tr('Data Engineer with 3+ years at Texas Instruments, building streaming, CDC and batch pipelines on hybrid on-prem + AWS infrastructure for semiconductor manufacturing and supply chain from MES, ERP and high-volume equipment-sensor data. Works daily on Linux with Python, SQL, PySpark, Rust, Kafka, Airflow and Apache Iceberg on Kubernetes and AWS.'),
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
      tr('Supply Chain & Manufacturing IT: data platforms for demand, supply and factory planning.'),
    points: [
      tr('Replaced memory-bound Spark ingestion of factory data by designing a Rust ETL engine for streaming and CDC replication; led a 3-engineer team to build it: 1.5 GB/s on a 4-node cluster, 3.8× Spark on identical hardware, 4-5× less memory per worker; in production since Apr 2026 at ~16 TB/day.'),
      tr('Cut the end-to-end supply-planning run from ~18h to ~45min (24×), so planners replan intra-day, by replacing sequential PL/SQL with parallel PySpark on Airflow and a new data architecture as one of three technical leads of a 20+ engineer programme.'),
      tr('Gave yield, logistics and planning teams one governed source for fab and assembly/test data as owner of the factory-data domain in TI’s lakehouse: Iceberg on MinIO and S3 (Glue Data Catalog), Trino and ClickHouse, Data Vault 2.0; ~6 PB/year of raw factory data.'),
      tr('Delivered MES, ERP and equipment-sensor data from 27 fab and assembly/test sites to analytics and operational stores at sub-second p95 through Kafka pipelines (MSK, Redpanda on EKS, Protobuf) designed with the ingestion team.'),
      tr('Moved supply-chain rule changes from a ~2-week release cycle to same-day with a rule-orchestration platform on EKS (FastAPI, React), built with one graduate engineer: backtests on past plans, approval flow, instant rollback.'),
      tr('Replaced slow, hanging cross-site queries with one API: designed the consolidation of 136 site-level databases into YugabyteDB on Kubernetes behind FastAPI (cross-team effort).'),
      tr('Turned statistical demand forecasts into 64-week factory build plans for TI’s global sites with PySpark services on Databricks the team built for the production-start planning engine.'),
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
      tr('Removed ~150 manual planner overrides per week after the team traced a systemic under-build of production starts across 70K+ SKUs to the fab-to-assembly production-start logic and fixed it.'),
      tr('Tuned the team’s production Spark jobs for 30-80% shorter runtimes through partitioning, skew and memory/spill fixes; ported the statistical forecasting job to PySpark on Databricks: 24h to under 7h.'),
      tr('Sized capacity and tuned SQL so the Kubernetes-hosted platform absorbs demand surges of a projected 2× load; mentored 2 junior engineers and 3 interns and shared the team’s on-call.'),
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
      tr('Built an internal election platform (MERN) for 10K+ employees with hierarchical authorisation.'),
    ],
    tags: ['MERN', 'AuthZ'],
  },
];

export type SkillGroup =
  | 'Languages'
  | 'Processing'
  | 'Lakehouse'
  | 'Databases'
  | 'DevOps'
  | 'Evaluated';

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
  { name: 'Airflow', group: 'Processing', icon: 'siApacheairflow' },
  { name: 'Databricks', group: 'Processing', icon: 'siDatabricks' },
  { name: 'dbt', group: 'Processing', icon: 'siDbt' },
  { name: 'Data Quality', group: 'Processing', mark: 'DQ', color: '#5a4032' },

  { name: 'Apache Iceberg', group: 'Lakehouse', mark: 'ICE', color: '#8b7766' },
  { name: 'MinIO', group: 'Lakehouse', mark: 'MIO', color: '#c72e49' },
  { name: 'Amazon S3', group: 'Lakehouse', icon: 'siAmazons3' },
  { name: 'Glue Data Catalog', group: 'Lakehouse', mark: 'GDC', color: '#8c4fff' },
  { name: 'Trino', group: 'Lakehouse', mark: 'TRN', color: '#dd00a1' },
  { name: 'ClickHouse', group: 'Lakehouse', icon: 'siClickhouse' },
  { name: 'Data Vault 2.0', group: 'Lakehouse', mark: 'DV', color: '#8e2f2a' },
  { name: 'Dimensional', group: 'Lakehouse', mark: '★', color: '#d49a57' },
  { name: 'Spotfire', group: 'Lakehouse', mark: 'SPF', color: '#b8612f' },

  { name: 'PostgreSQL', group: 'Databases', icon: 'siPostgresql' },
  { name: 'Oracle', group: 'Databases', mark: 'ORA', color: '#f80000' },
  { name: 'YugabyteDB', group: 'Databases', mark: 'YB', color: '#ff6e42' },
  { name: 'MySQL', group: 'Databases', icon: 'siMysql' },
  { name: 'Redis', group: 'Databases', icon: 'siRedis' },
  { name: 'FastAPI', group: 'Databases', mark: 'API', color: '#009688' },

  { name: 'Linux', group: 'DevOps', mark: 'LNX', color: '#d49a57' },
  { name: 'AWS', group: 'DevOps', icon: 'siAmazonwebservices' },
  { name: 'EKS · EC2 · ECR', group: 'DevOps', mark: 'AWS', color: '#ff9900' },
  { name: 'MSK · IAM · VPC', group: 'DevOps', mark: 'AWS', color: '#ff9900' },
  { name: 'Kubernetes', group: 'DevOps', icon: 'siKubernetes' },
  { name: 'VMware Tanzu', group: 'DevOps', mark: 'TZ', color: '#607078' },
  { name: 'Docker', group: 'DevOps', icon: 'siDocker' },
  { name: 'Helm', group: 'DevOps', mark: 'HLM', color: '#0f1689' },
  { name: 'Jenkins', group: 'DevOps', icon: 'siJenkins' },
  { name: 'ArgoCD', group: 'DevOps', icon: 'siArgo' },
  { name: 'Git', group: 'DevOps', icon: 'siGit' },
  { name: 'Prometheus', group: 'DevOps', icon: 'siPrometheus' },
  { name: 'Grafana', group: 'DevOps', icon: 'siGrafana' },
  { name: 'Vault', group: 'DevOps', mark: 'VLT', color: '#8e2f2a' },
  { name: 'Elastic', group: 'DevOps', mark: 'ELK', color: '#00bfb3' },

  { name: 'Azure', group: 'Evaluated', mark: 'AZ', color: '#0089d6' },
  { name: 'GCP', group: 'Evaluated', mark: 'GCP', color: '#4285f4' },
  { name: 'Delta Lake', group: 'Evaluated', mark: 'Δ', color: '#00add4' },
  { name: 'Terraform', group: 'Evaluated', icon: 'siTerraform' },
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
      tr('One of three technical leads of a 20+ engineer programme that replaced sequential PL/SQL with parallel PySpark on Airflow and a new data architecture, so planners replan intra-day.'),
    metric: '24×',
    metricLabel: tr('faster end-to-end supply-planning run'),
    compare: { before: 18, after: 0.75, beforeLabel: '~18h', afterLabel: '~45min' },
    gradient: ['#b8612f', '#8e2f2a'],
    tags: ['PySpark', 'Airflow', 'Planning'],
  },
  {
    category: tr('Ingestion engine'),
    period: tr('2026 – Now'),
    title: tr('Rust ETL Engine'),
    description:
      tr('My proposal and design, built by a 3-engineer team I led: streaming and CDC replication with exactly-once Iceberg commits, deduplicated ClickHouse loads and checkpoint recovery, 1.5 GB/s on a 4-node cluster, 4-5× less memory per worker; in production since Apr 2026 at ~16 TB/day, now ~100 production pipelines for 3+ teams.'),
    metric: `${num(3.8, 1)}×`,
    metricLabel: tr('throughput vs. Spark on identical hardware'),
    compare: { before: 1, after: 3.8, beforeLabel: 'Spark', afterLabel: `Rust · ${num(1.5, 1)} GB/s` },
    gradient: ['#d49a57', '#b8612f'],
    tags: ['Rust', 'Streaming · CDC', '~16 TB/day'],
  },
  {
    category: tr('Lakehouse'),
    period: tr('2025 – Now'),
    title: tr('Governed Lakehouse'),
    description:
      tr('Owner of the factory-data domain: Data Vault 2.0 on Iceberg over MinIO and S3 (Glue Data Catalog), served by Trino and ClickHouse; one governed source for yield, logistics and planning.'),
    metric: '~6 PB',
    metricLabel: tr('per year of raw factory data, my team’s intake into the domain I own'),
    gradient: ['#5a4032', '#2a1d16'],
    tags: ['Iceberg', 'Trino · ClickHouse', 'Data Vault 2.0'],
  },
  {
    category: tr('Streaming'),
    period: tr('2025 – Now'),
    title: tr('Global MES & ERP Streams'),
    description:
      tr('Kafka pipelines on MSK and Redpanda on EKS, designed with the ingestion team, carry MES, ERP and equipment-sensor data from 27 fab and assembly/test sites to analytics and operational stores.'),
    metric: '<1s',
    metricLabel: tr('p95 latency, site to operational store'),
    gradient: ['#c8ac8c', '#8b7766'],
    tags: ['Kafka', 'MSK · Redpanda', 'MES · ERP'],
  },
  {
    category: tr('Platform'),
    period: tr('2025 – Now'),
    title: tr('Rule Orchestration'),
    description:
      tr('Built with one graduate engineer on EKS (FastAPI, React): backtests on past plans, an approval flow and instant rollback for supply-chain rules, with an audit trail on every change.'),
    metric: tr('Same day'),
    metricLabel: tr('rule releases, down from a ~2-week cycle'),
    compare: { before: 14, after: 1, beforeLabel: tr('~2 weeks'), afterLabel: tr('same day') },
    gradient: ['#8e2f2a', '#5a4032'],
    tags: ['FastAPI · React', 'EKS', 'Backtests'],
  },
  {
    category: tr('Distributed DB'),
    period: tr('2025 – Now'),
    title: tr('Site DB Consolidation'),
    description:
      tr('136 site-level databases, consolidated into YugabyteDB on Kubernetes behind FastAPI: my design, in a cross-team effort.'),
    metric: '136 → 1',
    metricLabel: tr('one API instead of slow, hanging cross-site queries'),
    gradient: ['#d49a57', '#8e2f2a'],
    tags: ['YugabyteDB', 'FastAPI', 'Python'],
  },
  {
    category: tr('Planning engine'),
    period: tr('2025 – Now'),
    title: tr('Production-Start Planner'),
    description:
      tr('PySpark services on Databricks the team built to turn statistical demand forecasts into factory build plans for TI’s global sites.'),
    metric: tr('64 wks'),
    metricLabel: tr('planning horizon of the factory build plans'),
    gradient: ['#3b2a21', '#b8612f'],
    tags: ['PySpark', 'Databricks', 'Planning'],
  },
  {
    category: tr('Algorithms'),
    period: '2023 – 2025',
    title: tr('Production-Start Fix'),
    description:
      tr('The team traced a systemic under-build of production starts across 70K+ SKUs to the fab-to-assembly production-start logic and fixed it.'),
    metric: '~150',
    metricLabel: tr('manual planner overrides removed every week'),
    gradient: ['#b8612f', '#d49a57'],
    tags: ['Supply chain', 'SQL', 'Python'],
  },
];

export const achievements = [
  {
    title: tr('Technical Presentation at TI Headquarters'),
    org: tr('Texas Instruments HQ, Dallas'),
    date: tr('Aug 2026'),
    icon: 'presentation',
    color: '#b8612f',
    text: tr('Selected by the Director of IT to present the Rust ETL architecture to ~30 developers, managers and directors; its benchmarks became TI’s pipeline reference.'),
  },
  {
    title: tr('Winner, TI India ITS Tech Hackathon'),
    org: 'Texas Instruments',
    date: '2024',
    icon: 'trophy',
    color: '#d49a57',
    text: tr('Presenting author of the 5-person team that built an AI-optimised supply-chain simulator.'),
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
  { value: 16, suffix: ' TB', label: tr('Landed / day'), note: tr('factory data, via a Rust ETL engine'), tone: 'caramel' },
  { value: 136, suffix: '→1', label: tr('Databases'), note: tr('site DBs merged into one YugabyteDB cluster'), tone: 'foam' },
  { value: 3.8, decimals: 1, suffix: '×', label: tr('Rust vs Spark'), note: tr('total ingest, 1.5 GB/s on a 4-node cluster'), tone: 'cinnamon' },
  { value: 6, prefix: '~', suffix: ' PB', label: tr('Raw factory data / year'), note: tr('team intake into the factory-data domain I own'), tone: 'crema' },
  { value: 1, prefix: '<', suffix: 's', label: tr('p95 latency'), note: tr('MES, ERP & sensor streams from 27 sites'), tone: 'roast' },
  { value: 70, suffix: tr('K+'), label: tr('SKUs'), note: tr('on-time fulfilment improved'), tone: 'oat' },
  { value: 150, prefix: '−', suffix: '', label: tr('Overrides / week'), note: tr('manual planner fixes eliminated'), tone: 'oat' },
  { value: 64, suffix: tr(' wks'), label: tr('Build plans'), note: tr('factory build plans for TI’s global sites'), tone: 'oat' },
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
