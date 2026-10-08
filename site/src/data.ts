// All copy on the site comes from Yash's resume. Edit here, not in components.

export const profile = {
  name: 'Yash Aggarwal',
  firstName: 'Yash',
  initials: 'YA',
  role: 'Data Engineer',
  company: 'Texas Instruments',
  location: 'Bangalore, India',
  email: 'yashaggarwal85d@gmail.com',
  linkedin: 'https://www.linkedin.com/in/yashaggarwal85d/',
  github: 'https://github.com/yashaggarwal85d',
  tagline:
    'Data Engineer building the batch and streaming platforms behind semiconductor manufacturing and supply-chain planning.',
  summary:
    'Data Engineer with 3+ years at Texas Instruments, building the batch and streaming data platforms behind semiconductor manufacturing and supply-chain planning. Hands-on with Python, SQL, PySpark, Kafka and Airflow at multi-terabyte scale, lakehouse modelling (Iceberg, Data Vault 2.0) and CI/CD on Kubernetes.',
  availability: 'Ready to relocate · notice period 1–2 months · English (fluent)',
};

export const ribbonA = [
  'Data Engineer',
  'PySpark at scale',
  'Streaming with Kafka',
  'Lakehouse architect',
  'Rust ETL',
  'Data Vault 2.0',
  'Airflow & dbt',
  'CI/CD on Kubernetes',
];

export const ribbonB = [
  '18h → 45min',
  '16 TB / day',
  '~6 PB / year',
  '136 DBs → 1',
  'Sub-second p95',
  '70K+ SKUs',
  '64-week plans',
  'Same-day releases',
];

export const stats = [
  { value: 3, suffix: '+', label: 'Years at Texas Instruments', icon: 'calendar' },
  { value: 24, suffix: '×', label: 'Faster supply-plan run', icon: 'zap' },
  { value: 16, suffix: ' TB', label: 'Landed every day', icon: 'database' },
  { value: 70, suffix: 'K+', label: 'SKUs served by planning', icon: 'boxes' },
] as const;

export const education = {
  school: 'Thapar Institute of Engineering and Technology',
  place: 'Patiala, India',
  degree: 'B.E. in Computer Science & Engineering',
  grade: 'CGPA 9.07 / 10',
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
    period: 'Feb 2025 – Present',
    title: 'Data Engineer II',
    company: 'Texas Instruments',
    place: 'Bangalore, India',
    icon: 'server',
    color: '#ff3fb0',
    blurb:
      'Supply Chain & Manufacturing IT: data platforms for demand, supply and factory operations.',
    points: [
      'Cut the nightly supply-planning run from ~18h to ~45min (24×), so planners can replan intra-day, by driving the data-engineering track of a 20-engineer programme that rebuilt monolithic cron jobs as distributed PySpark services.',
      'Raised per-node ingest throughput 3.8× over the previous Spark jobs (1.5 GB/s on identical hardware) by building a Rust-based ETL engine that now lands ~16 TB/day of factory and operational data.',
      'Designed Data Vault 2.0 models on an Iceberg/ClickHouse lakehouse growing by ~6 PB/year, giving planners, yield and logistics teams one governed source for cross-application analytics.',
      'Streamed MES and ERP data from sites worldwide into the operational stores behind planning and factory applications at sub-second p95 latency, owning Kafka ingestion with S3/Iceberg as the raw landing zone.',
      'Took supply-chain rule changes from a ~2-week release cycle to same-day, with a full audit trail, by building a rule-orchestration platform with automated validation and staged rollouts.',
      'Merged 136 site-level databases into one distributed YugabyteDB cluster behind a unified Python/FastAPI layer, giving every site a single source of truth for production data.',
      'Designed the concurrent production-start planning engine that turns business rules and ML demand signals into 64-week factory build plans for every site.',
    ],
    tags: ['PySpark', 'Rust', 'Kafka', 'Iceberg', 'ClickHouse', 'YugabyteDB', 'FastAPI'],
  },
  {
    period: 'Jun 2023 – Feb 2025',
    title: 'Data Engineer',
    company: 'Texas Instruments',
    place: 'Bangalore, India',
    icon: 'workflow',
    color: '#3f7bff',
    points: [
      'Eliminated ~150 manual planner overrides per week and improved on-time fulfilment across 70K+ SKUs by fixing the fab-to-assembly start-signal logic behind a systemic under-build.',
      'Reduced production Spark runtimes by 30–80% through partitioning, skew and memory tuning; brought a legacy multi-model forecasting pipeline from 24h to under 7h.',
      'Let planners rerun forecast cycles on demand by productionising the Python demand-forecasting pipeline on Airflow, Spark and Oracle with modular data flows.',
      'Prepared production databases for a projected 2× load increase through capacity sizing, SQL tuning and on-call incident ownership; mentored 2 junior engineers and 3 interns.',
    ],
    tags: ['Spark', 'Airflow', 'Oracle', 'Python', 'SQL tuning'],
  },
  {
    period: 'Jan 2023 – Jun 2023',
    title: 'Software Development Intern',
    company: 'Texas Instruments',
    place: 'Bangalore, India',
    icon: 'code',
    color: '#2de8c0',
    points: [
      'Built and launched an internal election platform for 10K+ employees, with hierarchical authorisation.',
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
  | 'DevOps';

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
  { name: 'SQL', group: 'Languages', mark: 'SQL', color: '#3f7bff' },
  { name: 'Rust', group: 'Languages', icon: 'siRust' },
  { name: 'Java', group: 'Languages', icon: 'siOpenjdk' },

  { name: 'PySpark', group: 'Processing', icon: 'siApachespark' },
  { name: 'Spark SQL', group: 'Processing', icon: 'siApachespark' },
  { name: 'Kafka', group: 'Processing', icon: 'siApachekafka' },
  { name: 'Flink', group: 'Processing', icon: 'siApacheflink' },
  { name: 'Airflow', group: 'Processing', icon: 'siApacheairflow' },
  { name: 'dbt', group: 'Processing', icon: 'siDbt' },
  { name: 'Data Quality', group: 'Processing', mark: 'DQ', color: '#2de8c0' },

  { name: 'Apache Iceberg', group: 'Lakehouse', mark: 'ICE', color: '#5fb3ff' },
  { name: 'Delta Lake', group: 'Lakehouse', mark: 'Δ', color: '#00add4' },
  { name: 'Databricks', group: 'Lakehouse', icon: 'siDatabricks' },
  { name: 'ClickHouse', group: 'Lakehouse', icon: 'siClickhouse' },
  { name: 'Data Vault 2.0', group: 'Lakehouse', mark: 'DV', color: '#9b3bff' },
  { name: 'Dimensional', group: 'Lakehouse', mark: '★', color: '#ff3fb0' },

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
    category: 'Batch platform',
    period: '2025 – Now',
    title: 'Supply-Plan Re-platform',
    description:
      'Drove the data-engineering track of a 20-engineer programme that rebuilt monolithic cron jobs as distributed PySpark services, so planners can replan intra-day.',
    metric: '24×',
    metricLabel: 'faster nightly supply-planning run',
    compare: { before: 18, after: 0.75, beforeLabel: '~18h', afterLabel: '~45min' },
    gradient: ['#ff3fb0', '#9b3bff'],
    tags: ['PySpark', 'Distributed services', 'Planning'],
  },
  {
    category: 'Ingestion engine',
    period: '2025 – Now',
    title: 'Rust ETL Engine',
    description:
      'A Rust-based ETL engine that lands ~16 TB/day of factory and operational data at 1.5 GB/s per node on identical hardware.',
    metric: '3.8×',
    metricLabel: 'per-node throughput vs. previous Spark jobs',
    compare: { before: 1, after: 3.8, beforeLabel: 'Spark', afterLabel: 'Rust · 1.5 GB/s' },
    gradient: ['#3f7bff', '#2de8c0'],
    tags: ['Rust', 'ETL', '16 TB/day'],
  },
  {
    category: 'Lakehouse',
    period: '2025 – Now',
    title: 'Governed Lakehouse',
    description:
      'Data Vault 2.0 models on an Iceberg/ClickHouse lakehouse: one governed source for planners, yield and logistics teams.',
    metric: '~6 PB',
    metricLabel: 'of new data every year',
    gradient: ['#9b3bff', '#3f7bff'],
    tags: ['Iceberg', 'ClickHouse', 'Data Vault 2.0'],
  },
  {
    category: 'Streaming',
    period: '2025 – Now',
    title: 'Global MES & ERP Streams',
    description:
      'Owns Kafka ingestion from sites worldwide into the operational stores behind planning and factory apps, with S3/Iceberg as the raw landing zone.',
    metric: '<1s',
    metricLabel: 'p95 latency, site to operational store',
    gradient: ['#2de8c0', '#3f7bff'],
    tags: ['Kafka', 'S3', 'Iceberg'],
  },
  {
    category: 'Platform',
    period: '2025 – Now',
    title: 'Rule Orchestration',
    description:
      'Automated validation and staged rollouts for supply-chain business rules, with a full audit trail on every change.',
    metric: 'Same day',
    metricLabel: 'rule releases, down from a ~2-week cycle',
    compare: { before: 14, after: 1, beforeLabel: '~2 weeks', afterLabel: 'same day' },
    gradient: ['#ff3fb0', '#ff7a59'],
    tags: ['Python', 'Validation', 'Staged rollouts'],
  },
  {
    category: 'Distributed DB',
    period: '2025 – Now',
    title: 'Site DB Consolidation',
    description:
      'Merged every site-level database into one distributed YugabyteDB cluster behind a unified Python/FastAPI layer.',
    metric: '136 → 1',
    metricLabel: 'single source of truth for production data',
    gradient: ['#3f7bff', '#9b3bff'],
    tags: ['YugabyteDB', 'FastAPI', 'Python'],
  },
  {
    category: 'Planning engine',
    period: '2025 – Now',
    title: 'Production-Start Planner',
    description:
      'A concurrent engine that turns business rules and ML demand signals into factory build plans for every site.',
    metric: '64 wks',
    metricLabel: 'of build plans, generated per site',
    gradient: ['#9b3bff', '#ff3fb0'],
    tags: ['Concurrency', 'ML signals', 'Planning'],
  },
  {
    category: 'Algorithms',
    period: '2023 – 2025',
    title: 'Start-Signal Fix',
    description:
      'Fixed the fab-to-assembly start-signal logic behind a systemic under-build, improving on-time fulfilment across 70K+ SKUs.',
    metric: '~150',
    metricLabel: 'manual planner overrides removed every week',
    gradient: ['#2de8c0', '#9b3bff'],
    tags: ['Supply chain', 'SQL', 'Python'],
  },
];

export const achievements = [
  {
    title: 'Technical Presentation to Global IT Leadership',
    org: 'Texas Instruments HQ, Dallas',
    date: 'Aug 2026',
    icon: 'presentation',
    color: '#ff3fb0',
    text: 'Selected by the Director of IT to present the Rust ETL architecture; its benchmarks became the reference for TI’s global data pipelines.',
  },
  {
    title: 'Winner, TI India ITS Tech Hackathon',
    org: 'Texas Instruments',
    date: '2024',
    icon: 'trophy',
    color: '#ffb547',
    text: 'Led the team that built an AI-optimised supply-chain simulator.',
  },
  {
    title: 'Star of the Quarter Award',
    org: 'Texas Instruments',
    date: 'Q4 2024',
    icon: 'star',
    color: '#2de8c0',
    text: 'Recognised for planning algorithms and mentorship.',
  },
  {
    title: 'CGPA 9.07 / 10',
    org: 'Thapar Institute of Engineering and Technology',
    date: '2019 – 2023',
    icon: 'grad',
    color: '#3f7bff',
    text: 'B.E. in Computer Science & Engineering.',
  },
] as const;

export const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'work', label: 'Work' },
  { id: 'achievements', label: 'Awards' },
  { id: 'contact', label: 'Contact' },
] as const;
