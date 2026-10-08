<p align="center">
  <a href="https://yashaggarwal85d.github.io/yashaggarwal85d/"><img src="./assets/banner.svg" alt="Yash Aggarwal, Data Engineer at Texas Instruments" width="100%" /></a>
</p>

<p align="center">
  <a href="https://yashaggarwal85d.github.io/yashaggarwal85d/"><img src="https://img.shields.io/badge/%E2%96%B6_Watch_the_48s_showreel-b8612f?style=for-the-badge" alt="Watch the 48-second showreel" /></a>
  <a href="https://www.linkedin.com/in/yashaggarwal85d/"><img src="https://img.shields.io/badge/LinkedIn-yashaggarwal85d-5a4032?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMC40NSAyMC40NWgtMy41NnYtNS41N2MwLTEuMzMtLjAyLTMuMDQtMS44NS0zLjA0LTEuODYgMC0yLjE0IDEuNDUtMi4xNCAyLjk0djUuNjdIOS4zNVY5aDMuNDF2MS41NmguMDVjLjQ4LS45IDEuNjQtMS44NSAzLjM3LTEuODUgMy42IDAgNC4yNyAyLjM3IDQuMjcgNS40NnY2LjI4Wk01LjM0IDcuNDNhMi4wNiAyLjA2IDAgMSAxIDAtNC4xMyAyLjA2IDIuMDYgMCAwIDEgMCA0LjEzWk03LjEyIDIwLjQ1SDMuNTZWOWgzLjU2djExLjQ1WiIvPjwvc3ZnPg==" alt="LinkedIn" /></a>
  <a href="mailto:yashaggarwal85d@gmail.com"><img src="https://img.shields.io/badge/Email-say_hi-d49a57?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" /></a>
</p>

I build the **batch and streaming data platforms** behind semiconductor manufacturing and supply-chain planning at **Texas Instruments**: Python, SQL, PySpark, Kafka and Airflow at multi-terabyte scale, lakehouse modelling (Iceberg, Data Vault 2.0), and CI/CD on Kubernetes.

Off the clock I'm usually somewhere between a black hole, a qubit and a rewatch of *Interstellar*. My [portfolio](https://yashaggarwal85d.github.io/yashaggarwal85d/) is a 48-second showreel at 120 BPM. Move your mouse over it: the background is a keyboard.

### ☕ Freshly brewed numbers

| The shot | What went into it |
|---|---|
| 🚀 **18h → 45min** | Rebuilt monolithic cron jobs as distributed PySpark services. The nightly supply-planning run is **24× faster**, so planners can replan intra-day. |
| 🦀 **3.8× with Rust** | A Rust ETL engine that beats the previous Spark jobs per node (1.5 GB/s on identical hardware) and lands **~16 TB/day** of factory and operational data. |
| 🧊 **~6 PB / year** | Data Vault 2.0 models on an Iceberg/ClickHouse lakehouse: one governed source for planners, yield and logistics teams. |
| 📡 **< 1 s p95** | MES & ERP data streamed from sites worldwide through Kafka, with S3/Iceberg as the raw landing zone. |
| 🗄️ **136 → 1** | Merged 136 site-level databases into one distributed YugabyteDB cluster behind a Python/FastAPI layer. |
| 📦 **70K+ SKUs** | Fixed the fab-to-assembly start-signal logic, which removed ~150 manual planner overrides every week. |

### 🫘 How I brew data

```text
  Beans               Grind                  Brew                       Serve
  Kafka · MES/ERP ──▶ PySpark · Rust ETL ──▶ Iceberg · Data Vault 2.0 ──▶ ClickHouse ──▶ planners
```

### 🧰 Tech I work with

**Languages**<br/>
![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![SQL](https://img.shields.io/badge/SQL-4479A1?style=flat-square&logo=postgresql&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white)

**Processing & orchestration**<br/>
![Apache Spark](https://img.shields.io/badge/PySpark-E25A1C?style=flat-square&logo=apachespark&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Kafka-231F20?style=flat-square&logo=apachekafka&logoColor=white)
![Apache Flink](https://img.shields.io/badge/Flink-E6526F?style=flat-square&logo=apacheflink&logoColor=white)
![Airflow](https://img.shields.io/badge/Airflow-017CEE?style=flat-square&logo=apacheairflow&logoColor=white)
![dbt](https://img.shields.io/badge/dbt-FF694B?style=flat-square)

**Lakehouse & modelling**<br/>
![Apache Iceberg](https://img.shields.io/badge/Iceberg-2D6CDF?style=flat-square)
![Delta Lake](https://img.shields.io/badge/Delta%20Lake-00ADD4?style=flat-square)
![Databricks](https://img.shields.io/badge/Databricks-FF3621?style=flat-square&logo=databricks&logoColor=white)
![ClickHouse](https://img.shields.io/badge/ClickHouse-FFCC01?style=flat-square&logo=clickhouse&logoColor=black)
![Data Vault 2.0](https://img.shields.io/badge/Data%20Vault%202.0-6A29B8?style=flat-square)

**Databases & warehousing**<br/>
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=flat-square)
![YugabyteDB](https://img.shields.io/badge/YugabyteDB-FF6E42?style=flat-square)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-FF4438?style=flat-square&logo=redis&logoColor=white)
![Snowflake](https://img.shields.io/badge/Snowflake-29B5E8?style=flat-square&logo=snowflake&logoColor=white)

**Cloud, IaC & DevOps**<br/>
![AWS](https://img.shields.io/badge/AWS%20%28S3%2C%20EMR%2C%20Glue%29-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white)
![Azure](https://img.shields.io/badge/Azure%20%28ADF%2C%20ADLS%20Gen2%29-0089D6?style=flat-square)
![Terraform](https://img.shields.io/badge/Terraform-844FBA?style=flat-square&logo=terraform&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=flat-square&logo=jenkins&logoColor=white)
![ArgoCD](https://img.shields.io/badge/ArgoCD-EF7B4D?style=flat-square&logo=argo&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white)

### 🌌 Off the clock

| Interest | Why |
|---|---|
| 🕳️ **Astrophysics** | Black holes, general relativity, and how light bends around something it can't escape. |
| ⚛️ **Quantum computing** | Qubits that are both answers until you look. |
| ∑ **Maths** | *e*<sup>*iπ*</sup> + 1 = 0: five constants, one line, no notes. |
| 🎬 **Cinema** | Series, films and anime, with strong opinions about all of them. |

**On the shelf:** 🔪 *Dexter* · 🪐 *Interstellar* · 🌀 *Inception* · ↺ *Re:Zero*

### 🧑‍💻 A little more about me…

```python
yash = {
    "role": "Data Engineer II @ Texas Instruments",
    "based_in": "Bangalore, India",  # ready to relocate
    "experience": "3+ years",
    "daily_drivers": ["Python", "SQL", "PySpark", "Kafka", "Airflow", "Rust"],
    "data_at_rest": ["Iceberg", "ClickHouse", "YugabyteDB", "Oracle", "PostgreSQL"],
    "ask_me_about": ["lakehouse modelling", "Spark tuning", "streaming ingestion", "planning engines"],
    "thinks_about": ["black holes", "qubits", "e ** (1j * pi) + 1"],
    "on_repeat": ["Dexter", "Interstellar", "Inception", "Re:Zero"],
    "education": "B.E. CSE, Thapar Institute (CGPA 9.07/10)",
    "fun_fact": "There are two ways to write error-free programs; only the third one works.",
}
```

### 💼 Experience

- **Data Engineer II**, Texas Instruments · *Feb 2025 – Present*<br/>
  Rust ETL engine, Iceberg/ClickHouse lakehouse, global Kafka ingestion, rule orchestration, and the 64-week production-start planning engine.
- **Data Engineer**, Texas Instruments · *Jun 2023 – Feb 2025*<br/>
  Cut production Spark runtimes by 30–80% and took a forecasting pipeline from 24h to under 7h. Mentored 2 junior engineers and 3 interns.
- **Software Development Intern**, Texas Instruments · *Jan 2023 – Jun 2023*<br/>
  Built an internal election platform used by 10K+ employees.

### 🏆 Achievements

- 🎤 **Technical presentation to global IT leadership** (Aug 2026): presented the Rust ETL architecture at TI HQ in Dallas. Its benchmarks became the reference for TI's global data pipelines.
- 🥇 **Winner, TI India ITS Tech Hackathon** (2024): led the team that built an AI-optimised supply-chain simulator.
- ⭐ **Star of the Quarter, Texas Instruments** (Q4 2024): recognised for planning algorithms and mentorship.

### 🗄 Repositories

| | Repo | Description |
|---|---|---|
| 🎞️ | [Portfolio](./site) | This profile's website: a 48-second, 120 BPM showreel in React + three.js, on a mechanical-keyboard backdrop that reacts to your cursor. Try the Konami code. |
| 📦 | [Data Structures & Algorithms](https://github.com/yashaggarwal85d/Data-structures-and-Algorithms) | Data-structure and algorithm implementations in C++. |
| 📦 | [ProjectX1](https://github.com/yashaggarwal85d/ProjectX1) | A collaboration platform where team members and clients join projects and work through raised issues. |
| 📦 | [Blockchain](https://github.com/yashaggarwal85d/Blockchain) | A web and mobile chat app with public, private and anonymous modes, backed by encrypted data on a blockchain. |

<p align="center"><em>Got data at petabyte scale, or a film I should watch next? My <a href="mailto:yashaggarwal85d@gmail.com">inbox</a> is open ☕</em></p>
<p align="center"><sub>↺ This README loops too. Scroll back up.</sub></p>
