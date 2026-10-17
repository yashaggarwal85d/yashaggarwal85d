<p align="center">
  <a href="https://yashaggarwal85d.github.io/yashaggarwal85d/"><img src="./assets/banner.svg" alt="Yash Aggarwal, Data Engineer at Texas Instruments" width="100%" /></a>
</p>

Hi, I'm Yash, a data engineer at [Texas Instruments](https://www.ti.com) in Bangalore.

I build the pipelines that move semiconductor manufacturing and supply-chain data, from MES, ERP and equipment sensors across 27 fab and assembly/test sites, into an on-prem lakehouse that planners and yield engineers rely on every day. Most of my work is in Python, SQL, PySpark and Kafka, and lately a lot of it is in Rust.

### Selected work

- **Rust ETL engine.** I proposed and designed it, and built it mostly with one intern. It processes 1.5 GB/s per node, 3.8× faster than the Spark jobs it replaced on the same hardware, and has run in production since September 2026 on about 16 TB of factory data a day. I presented its architecture at TI headquarters in Dallas, and its benchmarks are now TI's reference for pipeline performance.
- **Supply-planning re-platform.** I was one of three technical leads, in a programme of 20+ engineers, that moved monolithic cron jobs to distributed PySpark services. The end-to-end planning run went from 18 hours to 45 minutes, so planners can now replan during the day.
- **Factory-data lakehouse domain.** I own the factory-data domain: about 6 PB a year in Apache Iceberg on MinIO, modelled with Data Vault 2.0 and served through ClickHouse.
- **Streaming ingestion.** Built with the ingestion team: Kafka pipelines carrying MES, ERP and sensor data from 27 sites to operational stores at under 1 s p95.
- **Database consolidation.** As part of a cross-team effort, we replaced 136 site-level databases with a single YugabyteDB cluster behind a FastAPI layer.

### Experience

| Role | Company | Dates |
|---|---|---|
| Data Engineer II | Texas Instruments | Feb 2025 – present |
| Data Engineer | Texas Instruments | Jun 2023 – Feb 2025 |
| Software Development Intern | Texas Instruments | Jan 2023 – Jun 2023 |

B.E. Computer Science, Thapar Institute of Engineering & Technology (CGPA 9.07/10).
Winner of the TI India ITS Tech Hackathon (2024) and TI Star of the Quarter (Q4 2024).

### Tools

**Daily:** Python, SQL, Rust, PySpark, Kafka, Airflow, Apache Iceberg, ClickHouse, MinIO, YugabyteDB, PostgreSQL, Oracle, Kubernetes, Linux<br/>
**Also used:** Java, Flink, Redis, FastAPI, Docker, Helm, Jenkins, Argo CD, Prometheus, Grafana, AWS, Databricks, dbt, Terraform

### Projects

- [**Portfolio**](https://yashaggarwal85d.github.io/yashaggarwal85d/) ([source](./site)): an animated intro, cut to the beat, built with React and three.js over a keyboard that reacts to your cursor.
- [**Data Structures & Algorithms**](https://github.com/yashaggarwal85d/Data-structures-and-Algorithms): implementations in C++.
- [**ProjectX1**](https://github.com/yashaggarwal85d/ProjectX1): a collaboration platform where teams and clients work through project issues together.
- [**Blockchain**](https://github.com/yashaggarwal85d/Blockchain): a web and mobile chat app with public, private and anonymous modes, backed by encrypted data on a blockchain.

### Outside work

Astrophysics, quantum computing, piano, films and anime, and cooking without a recipe.

### Contact

[LinkedIn](https://www.linkedin.com/in/yashaggarwal85d/) · [Email](mailto:yashaggarwal85d@gmail.com) · [Portfolio](https://yashaggarwal85d.github.io/yashaggarwal85d/)
