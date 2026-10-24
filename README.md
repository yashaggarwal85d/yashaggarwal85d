<p align="center">
  <a href="https://yashaggarwal85d.github.io/yashaggarwal85d/"><img src="./assets/banner.svg" alt="Yash Aggarwal: Data Engineer, Rust Developer, Full Stack Developer, Indie Game Developer" width="100%" /></a>
</p>

Hi, I'm Yash. I build systems that turn chaos into answers. Sensor streams, event firehoses and the occasional spreadsheet named `final_v7_REAL.xlsx` go in; data people can actually trust comes out. I've moved petabytes without losing a row, and once rewrote a pipeline in Rust just to see how fast "fast" could get (almost 4× faster, it turns out). My favourite systems are the ones nobody ever talks about, because nothing in them ever breaks.

By day that means Kafka, Spark, Airflow, Iceberg, ClickHouse and Trino, running on Kubernetes and AWS. In Rust I work with tokio, Arrow and DataFusion. On the full stack side I build FastAPI and Spring Boot backends behind React and Next.js frontends. And when the pipelines are quiet, I make indie games.

I'm actively contributing to open source, sending fixes upstream to [Apache DataFusion](https://github.com/apache/datafusion), [RisingWave](https://github.com/risingwavelabs/risingwave), [Rust](https://github.com/rust-lang/rust), [LLVM](https://github.com/llvm/llvm-project) and [Kubernetes](https://github.com/kubernetes/kubernetes). Every pull request I've opened is tracked in the table below.

I write in more languages than I can count on my fingers, and I'm always learning the next one. The blueprint is never finished.

**Portfolio:** [yashaggarwal85d.github.io](https://yashaggarwal85d.github.io/yashaggarwal85d/)

[LinkedIn](https://www.linkedin.com/in/yashaggarwal85d/) · [Email](mailto:yashaggarwal85d@gmail.com)

## Open source contributions

| Date | Project | Issue | Pull request | Status |
|---|---|---|---|---|
| 2026-10-24 | Rust | [#162109](https://github.com/rust-lang/rust/issues/162109) 1.99 regression: closure input type not inferred ("type annotations needed") | [#164836](https://github.com/rust-lang/rust/pull/164836) Add regression test for #162109 | Open |
| 2026-10-24 | LLVM | [#233277](https://github.com/llvm/llvm-project/issues/233277) clang-tidy modernize-type-traits suggests `tuple_size_v` inside constraints, changing meaning | [#235257](https://github.com/llvm/llvm-project/pull/235257) [clang-tidy] Don't suggest tuple_size_v in constraints in type-traits | Open |
| 2026-10-24 | Kubernetes | [#142345](https://github.com/kubernetes/kubernetes/issues/142345) conversion-gen doesn't pick up its own generated conversions across packages | [#143367](https://github.com/kubernetes/kubernetes/pull/143367) conversion-gen: use conversion functions generated in peer packages | Open |
| 2026-10-23 | RisingWave | [#27509](https://github.com/risingwavelabs/risingwave/issues/27509) Refreshable tables with a TTL watermark panic | [#27624](https://github.com/risingwavelabs/risingwave/pull/27624) fix(frontend): reject TTL watermarks on refreshable tables | Open |
| 2026-10-23 | DataFusion | [#26622](https://github.com/apache/datafusion/issues/26622) `x > ALL (subquery)` in the SELECT list fails unless aliased | [#26638](https://github.com/apache/datafusion/pull/26638) fix: preserve expression names in RewriteSetComparison | Open (draft) |
| 2026-10-23 | DataFusion | [#26628](https://github.com/apache/datafusion/issues/26628) Sorted Final/Single aggregates fail with ResourcesExhausted | [#26637](https://github.com/apache/datafusion/pull/26637) fix: emit completed groups when fully sorted final and single aggregates run out of memory | Open |
| 2026-10-22 | RisingWave | [#27595](https://github.com/risingwavelabs/risingwave/issues/27595) Window sum/bit_\*/bool_\* don't return NULL when the frame empties | [#27605](https://github.com/risingwavelabs/risingwave/pull/27605) fix(expr): output NULL for window sum/bit_\*/bool_\* when no non-NULL input is left | Open |
| 2026-10-22 | DataFusion | [#26488](https://github.com/apache/datafusion/issues/26488) SortExec dropped below OFFSET under an aggregate | [#26584](https://github.com/apache/datafusion/pull/26584) fix: keep sort below OFFSET when the sort columns are projected away | Open |
| 2026-10-21 | RisingWave | [#27451](https://github.com/risingwavelabs/risingwave/issues/27451) Incorrect NULL row in streaming MV after GROUP BY | [#27594](https://github.com/risingwavelabs/risingwave/pull/27594) fix(optimizer): keep at least one group key in AggGroupBySimplifyRule | Open |
| 2026-10-21 | DataFusion | [#26285](https://github.com/apache/datafusion/issues/26285) Correlated `EXISTS` on a `CASE`/`UNION ALL` column fails | [#26558](https://github.com/apache/datafusion/pull/26558) fix: coerce correlated subqueries against the outer column's coerced type | Open |
| 2026-10-21 | DataFusion | [#26549](https://github.com/apache/datafusion/issues/26549) Security audit CI failing (RUSTSEC-2026-0382/0383) | [#26550](https://github.com/apache/datafusion/pull/26550) chore(deps): bump rustls-webpki and webpki-root-certs | Merged (2026-10-22) |
