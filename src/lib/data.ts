// All portfolio content. Single source of truth.

export type Project = {
  n: string;
  name: string;
  tags: ("ml" | "sec" | "oss")[];
  lang: string;
  year: string;
  stars: string;
  blurb: string;
  stack: string[];
  demo: string;
};

export type WritingEntry = {
  ts: string;
  lvl: "INFO" | "NOTE" | "WARN" | "HACK" | "STDY";
  title: string;
  sub: string;
  tags: string[];
};

export type Repo = {
  name: string;
  desc: string;
  stars: string;
  forks: string;
  lang: string;
  color: string;
};

export type Skill = { n: string; v: number; since: string };

export type TimelineEntry = {
  when: string;
  role: string;
  at: string;
  notes: string;
  commits: { k: string; v: string }[];
  cur?: boolean;
};

export type Proc = {
  pid: string;
  cmd: string;
  arg: string;
  cpu: string;
  mem: string;
  hot?: boolean;
};

export const identity = {
  name: "Thathsara Madusha",
  handle: "thathsara",
  role: "ML \u00d7 Cloud Security Engineer",
  location: "Colombo, LK",
  timezone: "UTC+05:30",
  email: "hi@thathsara.dev",
  github: "thathsara",
  twitter: "thathsara_m",
  pgp: "A5F8 2C0D 9E11 4B73",
  status: "shipping",
  uptime: "2y 14d",
};

export const bio = {
  lead: "I build models that learn from data the cloud isn\u2019t supposed to leak \u2014 and the boring plumbing that keeps both true at 3am.",
  paragraphs: [
    "I\u2019m an engineer working at the awkward seam between machine learning and cloud security. The seam where your shiny model gets one secret from Vault, three from a misconfigured S3 bucket, and your IAM policy reads like a love letter to lateral movement.",
    "Most days I\u2019m fine-tuning small models that run on-device, writing Terraform that won\u2019t embarrass me in an audit, and reading CloudTrail logs the way other people read novels. Some nights I write about it.",
    "Previously: ML platform at a fintech you\u2019ve probably used, security engineering at an infra startup you definitely haven\u2019t. Currently: building <code>shadow-rbac</code> as a stealth research lead, and shipping <code>drift-watch</code> to a few people who pay me to keep their P&Ls honest.",
  ],
};

export const projects: Project[] = [
  {
    n: "01",
    name: "shadow-rbac",
    tags: ["ml", "sec"],
    lang: "Rust, Python",
    year: "2026",
    stars: "2.4k",
    blurb:
      "Graph-embedding IAM policies across an AWS org to surface over-privileged roles before they\u2019re abused. Trains on access patterns from CloudTrail, predicts the smallest IAM doc that would have served the last 90 days. Currently catching 6\u20139% of access denials per week without breaking anyone.",
    stack: [
      "PyTorch Geometric",
      "DGL",
      "AWS Organizations",
      "CloudTrail",
      "Athena",
    ],
    demo: "kind: GraphSAGE\nnodes: 412,883 (roles + actions)\nF1 over-priv: 0.91\nfalse positives/wk: 3\nshipping to: 14 orgs",
  },
  {
    n: "02",
    name: "drift-watch",
    tags: ["ml", "oss"],
    lang: "Python, Go",
    year: "2025",
    stars: "8.1k",
    blurb:
      "Real-time data + concept drift detection for production ML, with a P&L attribution view that tells you which models lost you money this quarter and why. Plugs into Kafka, Prometheus, MLflow. Used by ~40 prod systems across fintech, ad-tech, an actual airline.",
    stack: [
      "Kafka",
      "Prometheus",
      "MLflow",
      "Pandas",
      "Polars",
      "KS / MMD / PSI",
    ],
    demo: "streams: 312\nmodels watched: 47\np99 detect latency: 1.2s\nmoney recovered (Q3): $1.4M",
  },
  {
    n: "03",
    name: "citadel",
    tags: ["ml", "sec"],
    lang: "Rust",
    year: "2024",
    stars: "1.3k",
    blurb:
      "Encrypted vector database with row-level secret management. Embeddings sit at rest in an HSM-wrapped envelope; cosine sim happens inside the enclave. For when your RAG pipeline shouldn\u2019t leak the documents it\u2019s grounded on.",
    stack: ["Rust", "FAISS", "AWS Nitro Enclaves", "KMS", "HKDF"],
    demo: "recall@10 vs FAISS-IVF: -0.4%\noverhead per query: 8ms\nleak budget: 0 bits\nin prod at: 3 healthcare orgs",
  },
  {
    n: "04",
    name: "pii-scrub",
    tags: ["ml", "oss"],
    lang: "Python",
    year: "2024",
    stars: "4.2k",
    blurb:
      "On-device PII redaction in 8 languages, fine-tuned DistilBERT distilled down to 14MB. Runs at 4k tokens/sec on a Pi. Used in a couple of mobile keyboards you may have already typed into today.",
    stack: [
      "HuggingFace",
      "ONNX",
      "INT8 quant",
      "Sinhala/Tamil/Hindi adapters",
    ],
    demo: "token speed: 4,212/s (Pi 5)\nrecall (en): 0.97\nmodel size: 14.2 MB\nlangs: en si ta hi ar id ms fil",
  },
  {
    n: "05",
    name: "smolflare",
    tags: ["sec", "oss"],
    lang: "TypeScript",
    year: "2023",
    stars: "672",
    blurb:
      "Generate ModSecurity / Cloudflare WAF rules from natural-language threat descriptions. \u201cblock anything that looks like SQLi from Belarus\u201d becomes 14 actually-correct rules with explanations. Not a chatbot, an interpreter.",
    stack: ["TS", "ANTLR", "OWASP CRS", "small LLM (Phi-2 tuned)"],
    demo: "rule fidelity: 0.94\nfalse positives: 0.3%\nlatency: 80ms p50\ncompiled rulesets: 2,300+",
  },
];

export const writing: WritingEntry[] = [
  {
    ts: "2026-04-18",
    lvl: "NOTE",
    title: "What 90 days of pretraining taught me about good losses",
    sub: "Loss curves you can read like a heart-rate monitor.",
    tags: ["ml", "training", "eng"],
  },
  {
    ts: "2026-02-02",
    lvl: "WARN",
    title: "STS, SCPs, and the geometry of least privilege",
    sub: "IAM as a partially-ordered set. Why your role hierarchy is actually a poset.",
    tags: ["aws", "iam", "security"],
  },
  {
    ts: "2025-11-09",
    lvl: "INFO",
    title: "Your drift detector is a P&L document",
    sub: "A short manifesto for tying ML metrics to dollars before your VP does it for you.",
    tags: ["mlops", "finance"],
  },
  {
    ts: "2025-09-14",
    lvl: "HACK",
    title: "Reading IAM like a graph (and what falls out)",
    sub: "A weekend exercise that turned into an open-source tool and three CVEs.",
    tags: ["security", "graphs"],
  },
  {
    ts: "2025-06-30",
    lvl: "STDY",
    title: "Towards differentiable security policies",
    sub: "Position paper draft. What if WAF rules had gradients?",
    tags: ["research", "security", "ml"],
  },
  {
    ts: "2025-04-05",
    lvl: "NOTE",
    title: "Quantization is mostly a UX problem",
    sub: "Why nobody ships INT8: the bugs are silent and the dashboards lie.",
    tags: ["ml", "inference"],
  },
  {
    ts: "2025-01-22",
    lvl: "INFO",
    title: "A cheap private RAG that actually stays private",
    sub: "Threat model, attack surface, and the seven things people get wrong.",
    tags: ["rag", "security"],
  },
  {
    ts: "2024-10-12",
    lvl: "HACK",
    title: "I read 1.4 million CloudTrail events so you don\u2019t have to",
    sub: "A pattern catalog of weird-but-benign IAM behavior.",
    tags: ["aws", "security", "data"],
  },
];

export const repos: Repo[] = [
  {
    name: "drift-watch",
    desc: "Real-time data & concept drift detection for production ML.",
    stars: "8.1k",
    forks: "412",
    lang: "Python",
    color: "#3572A5",
  },
  {
    name: "pii-scrub",
    desc: "On-device multilingual PII redaction, 14MB model.",
    stars: "4.2k",
    forks: "188",
    lang: "Python",
    color: "#3572A5",
  },
  {
    name: "shadow-rbac",
    desc: "Graph embeddings for AWS IAM least-privilege.",
    stars: "2.4k",
    forks: "97",
    lang: "Rust",
    color: "#dea584",
  },
  {
    name: "citadel",
    desc: "Encrypted vector DB inside AWS Nitro Enclaves.",
    stars: "1.3k",
    forks: "54",
    lang: "Rust",
    color: "#dea584",
  },
  {
    name: "smolflare",
    desc: "Natural language \u2192 WAF rules. Not a chatbot.",
    stars: "672",
    forks: "31",
    lang: "TypeScript",
    color: "#2b7489",
  },
  {
    name: "tfsec-redux",
    desc: "A faster, opinionated tfsec fork with ML rule suggestions.",
    stars: "514",
    forks: "22",
    lang: "Go",
    color: "#00ADD8",
  },
];

export const skills: Record<string, Skill[]> = {
  "Machine Learning": [
    { n: "PyTorch", v: 0.95, since: "2019" },
    { n: "JAX", v: 0.75, since: "2022" },
    { n: "HuggingFace", v: 0.92, since: "2020" },
    { n: "Triton / CUDA", v: 0.62, since: "2023" },
    { n: "ONNX / TFLite", v: 0.84, since: "2021" },
    { n: "Ray / Dask", v: 0.78, since: "2021" },
  ],
  "Cloud Security": [
    { n: "AWS IAM/STS/KMS", v: 0.96, since: "2018" },
    { n: "AWS GuardDuty / Config", v: 0.88, since: "2020" },
    { n: "GCP IAM / VPC-SC", v: 0.74, since: "2022" },
    { n: "Terraform / Pulumi", v: 0.91, since: "2019" },
    { n: "eBPF / Falco / Cilium", v: 0.68, since: "2023" },
    { n: "Vault / SOPS", v: 0.84, since: "2020" },
  ],
  Languages: [
    { n: "Python", v: 0.98, since: "2015" },
    { n: "Rust", v: 0.78, since: "2022" },
    { n: "Go", v: 0.82, since: "2020" },
    { n: "TypeScript", v: 0.85, since: "2019" },
    { n: "SQL", v: 0.9, since: "2016" },
    { n: "Bash", v: 0.87, since: "2015" },
  ],
  "Infra & Practice": [
    { n: "Kubernetes", v: 0.86, since: "2019" },
    { n: "Postgres / Citus", v: 0.84, since: "2017" },
    { n: "Kafka / Redpanda", v: 0.79, since: "2020" },
    { n: "STRIDE / Threat-mod.", v: 0.91, since: "2019" },
    { n: "Incident response", v: 0.83, since: "2021" },
    { n: "Code review", v: 0.94, since: "2017" },
  ],
};

export const timeline: TimelineEntry[] = [
  {
    when: "2026 \u2014 now",
    role: "ML Security Lead",
    at: "stealth, 6 ppl",
    notes:
      "Building shadow-rbac as a product. Differentiable policy synthesis on real org graphs. Hiring 1 staff eng + 1 security researcher.",
    commits: [
      { k: "shipped", v: "shadow-rbac v0.8" },
      { k: "wrote", v: "2 papers" },
      { k: "on-call", v: "8 nights/mo" },
    ],
    cur: true,
  },
  {
    when: "2024 \u2014 2026",
    role: "Senior ML Engineer",
    at: "Helm (fintech)",
    notes:
      "Owned the drift + monitoring stack for 47 production models. Reduced silent failures from ~6/quarter to 0 in 11 months. Built drift-watch in the process.",
    commits: [
      { k: "shipped", v: "drift-watch" },
      { k: "led", v: "team of 4" },
      { k: "caught", v: "$3.1M in silent drift" },
    ],
  },
  {
    when: "2022 \u2014 2024",
    role: "Security Engineer",
    at: "Octant (infra)",
    notes:
      "Cloud security review, IAM least-privilege rollouts across 14 AWS accounts, incident response on-call. Wrote the original PoC of what became smolflare.",
    commits: [
      { k: "auth\u2019d", v: "3 SOC2 audits" },
      { k: "cut", v: "IAM perms by 73%" },
      { k: "IR", v: "lead on 7 incidents" },
    ],
  },
  {
    when: "2020 \u2014 2022",
    role: "ML Engineer",
    at: "Trifecta (ad-tech)",
    notes:
      "Recommender systems at the seam between ad serving and fraud. First production model that lived past one quarter.",
    commits: [
      { k: "CTR", v: "+11.3%" },
      { k: "wrote", v: "first blog post" },
    ],
  },
  {
    when: "2019",
    role: "BSc Computer Science",
    at: "Univ. of Moratuwa",
    notes:
      "Thesis on adversarial robustness for ImageNet classifiers \u2014 mostly an excuse to spend nine months reading Madry & Goodfellow.",
    commits: [{ k: "thesis", v: "first-class" }],
  },
  {
    when: "2017",
    role: "First CTF win",
    at: "NDC Colombo",
    notes: "Got hooked. Have not stopped.",
    commits: [
      { k: "team", v: "0xC0FFEE" },
      { k: "placed", v: "1st of 42" },
    ],
  },
];

export const now = {
  procs: [
    {
      pid: "0x01",
      cmd: "train.py",
      arg: "--model shadow-rbac-350M --steps 14000",
      cpu: "94%",
      mem: "38G",
      hot: true,
    },
    {
      pid: "0x02",
      cmd: "edit",
      arg: "book/ch3-verifiable-ml.md",
      cpu: "4%",
      mem: "128M",
    },
    {
      pid: "0x03",
      cmd: "review",
      arg: "PRs/drift-watch#412",
      cpu: "11%",
      mem: "512M",
    },
    {
      pid: "0x04",
      cmd: "read",
      arg: "Murphy \u2014 Probabilistic ML II, ch. 24",
      cpu: "2%",
      mem: "64M",
    },
    {
      pid: "0x05",
      cmd: "on-call",
      arg: "--rotation primary --pager armed",
      cpu: "0%",
      mem: "8M",
    },
    {
      pid: "0x06",
      cmd: "brew",
      arg: "--method v60 --beans hario-honduras",
      cpu: "70%",
      mem: "\u221e",
    },
  ] as Proc[],
  reading: [
    {
      state: "cur",
      t: "Probabilistic ML II: Advanced Topics",
      by: "Kevin Murphy",
    },
    { state: "cur", t: "Cloud Native Security", by: "Rice / Watt / Lewis" },
    { state: "done", t: "The Garden of Forking Paths", by: "Borges" },
    { state: "todo", t: "Designing ML Systems", by: "Chip Huyen (re-read)" },
    { state: "todo", t: "A Pattern Language", by: "Alexander et al." },
  ],
  inbox: [
    {
      who: "awscloudtrail-noreply",
      subj: "GuardDuty: 2 medium findings (org-prod)",
      when: "14m",
      sev: "MD",
    },
    {
      who: "pagerduty",
      subj: "[resolved] drift-watch ingest latency p99",
      when: "2h",
      sev: "LO",
    },
    {
      who: "github-actions",
      subj: "shadow-rbac CI: green (1,412 tests)",
      when: "3h",
      sev: "LO",
    },
    {
      who: "arxiv",
      subj: "Daily digest: cs.CR + cs.LG (32 papers)",
      when: "6h",
      sev: "LO",
    },
  ],
};

export const ticker = [
  { src: "guardduty", msg: "org-prod scan: 0 critical, 2 medium (suppressed)" },
  {
    src: "drift-watch",
    msg: "model:checkout-fraud KS shift detected, p=0.013",
  },
  {
    src: "cloudtrail",
    msg: "AssumeRole spike from svc-batch (within baseline)",
  },
  { src: "shadow-rbac", msg: "epoch 142 loss=0.041 F1=0.91 lr=3e-5" },
  {
    src: "github",
    msg: "merged: drift-watch#411 \u201cnudge PSI default bin count\u201d",
  },
  {
    src: "arxiv",
    msg: "Subgraph attacks against RAG: new threat model dropped",
  },
  { src: "on-call", msg: "pager armed \u2014 0 incidents, 14 days clean" },
  { src: "coffee", msg: "v60 #3 brewed, brain delta +18% (self-reported)" },
];

export const workspaces = [
  { id: "hero", num: 1, label: "hero" },
  { id: "about", num: 2, label: "about" },
  { id: "projects", num: 3, label: "projects" },
  { id: "oss", num: 4, label: "oss" },
  { id: "blog", num: 5, label: "writing" },
  { id: "stack", num: 6, label: "stack" },
  { id: "cv", num: 7, label: "cv" },
  { id: "now", num: 8, label: "now" },
] as const;

export type WorkspaceId = (typeof workspaces)[number]["id"];
