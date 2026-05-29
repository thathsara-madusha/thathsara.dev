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
  github?: string;
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
  role: "Software Engineer & DevOps Practitioner",
  location: "Colombo, LK",
  timezone: "UTC+05:30",
  email: "thathsaramadhhusha@gmail.com",
  github: "nova9",
  twitter: "thathsara_m",
  pgp: "A5F8 2C0D 9E11 4B73",
  status: "building",
  uptime: "2y 6m",
};

export const bio = {
  lead: "Software engineer at UCSC building full-stack systems and the DevOps plumbing that keeps them honest — from Kubernetes clusters to AI-powered platforms.",
  paragraphs: [
    "I’m a software engineer at the University of Colombo School of Computing. I work across the stack: backend services in Go, React frontends, container orchestration with Kubernetes, and cloud infra on AWS and GCP.",
    "I’ve shipped production features as a full-stack intern at WSO2, built freelance Laravel apps from 2022–2024, and run a self-hosted homelab exposed to the public internet. I like building things that actually run and don’t fall over.",
    "Currently researching DDoS-aware autoscaling in cloud environments and data exfiltration via TCP SYN packets. Previously: Organizing Committee VP at AIESEC Insight 2024. I hold the Director’s List Award for academic excellence in 2023 and 2024.",
  ],
};

export const projects: Project[] = [
  {
    n: "01",
    name: "homelab",
    tags: ["sec", "oss"],
    lang: "YAML, Shell",
    year: "2024",
    stars: "—",
    blurb:
      "Self-hosted infrastructure lab running production-grade services on commodity hardware, exposed to the public internet. Kubernetes for container orchestration, Nginx as reverse proxy with TLS termination. Full observability via Grafana and Prometheus dashboards.",
    stack: ["Kubernetes", "Nginx", "Grafana", "Prometheus", "Terraform", "TLS"],
    demo: "cluster: Kubernetes\nproxy: Nginx + TLS termination\nobservability: Grafana + Prometheus\nexposed: public internet",
  },
  {
    n: "02",
    name: "smile",
    tags: ["ml", "oss"],
    lang: "PHP, JavaScript",
    year: "2025",
    stars: "—",
    blurb:
      "Volunteer management platform with an AI-powered event recommendation engine. Matches volunteers to opportunities using OpenAI embeddings + cosine similarity over Google Maps data. Real-time messaging between volunteers and organisers, plus AWS Rekognition for identity verification.",
    stack: ["Laravel", "Livewire", "Volt", "OpenAI", "AWS Rekognition", "Google Maps API"],
    demo: "rec engine: cosine similarity\nembeddings: OpenAI\nverification: AWS Rekognition\ncomms: real-time messaging",
    github: "https://github.com/nova9/smile",
  },
  {
    n: "03",
    name: "pixel-ai",
    tags: ["ml", "oss"],
    lang: "TypeScript, Ballerina",
    year: "2025",
    stars: "—",
    blurb:
      "Comprehensive e-learning platform with AI-driven content generation. React/TypeScript frontend backed by a Ballerina microservices API covering user management, content delivery, exam management, and progress tracking. OpenAI for generation, MySQL for persistence, AWS SES for auth.",
    stack: ["React", "TypeScript", "Ballerina", "OpenAI", "MySQL", "AWS SES"],
    demo: "services: user, content, exam, progress\nauth: AWS SES\ncontent gen: OpenAI\nAPI: RESTful modular",
    github: "https://github.com/nova9/pixel-ai",
  },
  {
    n: "04",
    name: "talent-pipeline",
    tags: ["ml", "sec"],
    lang: "TypeScript, PHP",
    year: "2025",
    stars: "—",
    blurb:
      "Cloud-native recruitment platform that processed 12,000+ résumé PDFs using OpenAI. Deployed on Kubernetes via Terraform with a React/Laravel stack. AI-driven features connecting candidates, employers, and recruiters for career guidance and streamlined hiring at scale.",
    stack: ["React", "Laravel", "Kubernetes", "Terraform", "OpenAI", "AWS"],
    demo: "resumes processed: 12,000+\ninfra: Kubernetes via Terraform\nstack: React + Laravel\nfeatures: AI matching, career guidance",
  },
  {
    n: "05",
    name: "launchpad",
    tags: ["oss", "sec"],
    lang: "PHP",
    year: "2024",
    stars: "—",
    blurb:
      "Internship management system built on a custom MVC PHP framework written from scratch — routing, middleware, and ORM included. Established automated test coverage with Pest for unit tests and Selenium for end-to-end browser testing.",
    stack: ["PHP", "Custom MVC", "Pest", "Selenium", "MySQL"],
    demo: "framework: built from scratch\nrouting + ORM: custom\nunit tests: Pest\nE2E tests: Selenium",
    github: "https://github.com/nova9/launchpad",
  },
];

export const writing: WritingEntry[] = [
  {
    ts: "2026-05-01",
    lvl: "STDY",
    title: "DDoS-Aware Autoscaling: distinguishing legitimate vs. malicious traffic",
    sub: "Research notes on EDoS attacks and resource allocation under adversarial load.",
    tags: ["cloud", "security", "research"],
  },
  {
    ts: "2025-12-10",
    lvl: "HACK",
    title: "Bypassing Deep Packet Inspection via Data-in-SYN Packets",
    sub: "Technical feasibility and economic viability of embedding data in TCP SYN packets.",
    tags: ["networking", "security", "research"],
  },
  {
    ts: "2025-09-14",
    lvl: "NOTE",
    title: "Building a volunteer matching engine with OpenAI embeddings",
    sub: "Cosine similarity over embeddings + Google Maps for event-volunteer matching.",
    tags: ["ml", "embeddings", "laravel"],
  },
  {
    ts: "2025-08-20",
    lvl: "INFO",
    title: "Processing 12,000 résumés with OpenAI on Kubernetes",
    sub: "Lessons from building a scalable AI recruitment pipeline on a student budget.",
    tags: ["k8s", "openai", "cloud"],
  },
  {
    ts: "2025-07-05",
    lvl: "HACK",
    title: "Ballerina as a backend language: a React dev’s perspective",
    sub: "What it’s like to wire up a Ballerina microservices API for the first time.",
    tags: ["ballerina", "backend", "api"],
  },
  {
    ts: "2025-02-14",
    lvl: "NOTE",
    title: "WSO2 internship: shipping persistent storage across 6 codebases",
    sub: "Full-stack feature delivery through senior review, CI, and integration validation.",
    tags: ["go", "react", "wso2"],
  },
  {
    ts: "2024-11-03",
    lvl: "INFO",
    title: "Building a PHP MVC framework from scratch",
    sub: "Routing, middleware, and ORM — what I learned skipping the framework.",
    tags: ["php", "mvc", "architecture"],
  },
  {
    ts: "2024-06-20",
    lvl: "HACK",
    title: "Homelab on commodity hardware: Kubernetes, Nginx, and public internet exposure",
    sub: "Running production-grade infra at home without spending production-grade money.",
    tags: ["k8s", "homelab", "devops"],
  },
];

export const repos: Repo[] = [
  {
    name: "smile",
    desc: "Volunteer management platform with AI-powered event matching.",
    stars: "12",
    forks: "3",
    lang: "PHP",
    color: "#4f5d95",
  },
  {
    name: "pixel-ai",
    desc: "E-learning platform with Ballerina backend and OpenAI content gen.",
    stars: "8",
    forks: "2",
    lang: "TypeScript",
    color: "#2b7489",
  },
  {
    name: "talent-pipeline",
    desc: "Cloud-native recruitment platform — 12k résumés processed with OpenAI.",
    stars: "6",
    forks: "1",
    lang: "PHP",
    color: "#4f5d95",
  },
  {
    name: "launchpad",
    desc: "Internship management system on a custom PHP MVC framework.",
    stars: "15",
    forks: "4",
    lang: "PHP",
    color: "#4f5d95",
  },
  {
    name: "homelab",
    desc: "Self-hosted K8s infra with Nginx, Grafana, and Prometheus.",
    stars: "9",
    forks: "2",
    lang: "Shell",
    color: "#89e051",
  },
  {
    name: "thathsara.dev",
    desc: "This site. Astro + Svelte terminal-style portfolio.",
    stars: "5",
    forks: "1",
    lang: "TypeScript",
    color: "#2b7489",
  },
];

export const skills: Record<string, Skill[]> = {
  Languages: [
    { n: "Go", v: 0.85, since: "2024" },
    { n: "JavaScript / TypeScript", v: 0.9, since: "2022" },
    { n: "PHP", v: 0.88, since: "2022" },
    { n: "Python", v: 0.8, since: "2023" },
    { n: "C / C++", v: 0.65, since: "2023" },
    { n: "SQL", v: 0.82, since: "2022" },
  ],
  Web: [
    { n: "Laravel", v: 0.9, since: "2022" },
    { n: "React", v: 0.88, since: "2023" },
    { n: "Vue.JS", v: 0.72, since: "2023" },
    { n: "NodeJS", v: 0.8, since: "2022" },
    { n: "Livewire / Volt", v: 0.78, since: "2024" },
    { n: "Ballerina", v: 0.65, since: "2025" },
  ],
  "Tools & DevOps": [
    { n: "Docker", v: 0.88, since: "2023" },
    { n: "Kubernetes", v: 0.82, since: "2024" },
    { n: "Terraform", v: 0.76, since: "2025" },
    { n: "GitHub Actions", v: 0.85, since: "2023" },
    { n: "Grafana / Prometheus", v: 0.78, since: "2024" },
    { n: "Git", v: 0.92, since: "2022" },
  ],
  Platforms: [
    { n: "Amazon Web Services", v: 0.8, since: "2024" },
    { n: "Google Cloud Platform", v: 0.68, since: "2025" },
    { n: "Nginx", v: 0.82, since: "2024" },
    { n: "MySQL / PostgreSQL", v: 0.84, since: "2022" },
    { n: "Linux / Shell", v: 0.85, since: "2022" },
    { n: "Selenium / Pest", v: 0.72, since: "2024" },
  ],
};

export const timeline: TimelineEntry[] = [
  {
    when: "2025 — 2026",
    role: "Intern Software Engineer",
    at: "WSO2 LLC",
    notes:
      "Designed and shipped a full-stack feature for persistent storage attachment to cloud applications. Backend services in Go handling volume lifecycle management and deduplication. React/TypeScript marketplace UI for shared storage resources. Coordinated across 6 codebases and 3 teams.",
    commits: [
      { k: "PRs", v: "7 merged" },
      { k: "lang", v: "Go + React/TS" },
      { k: "scope", v: "6 codebases" },
    ],
  },
  {
    when: "2023 — now",
    role: "BSc Computer Science (Hons.)",
    at: "UCSC, Colombo",
    notes:
      "GPA 3.66. Director’s List 2023 and 2024. Researching DDoS-aware autoscaling and TCP SYN data exfiltration. AIESEC Organizing Committee VP for Insight 2024.",
    commits: [
      { k: "GPA", v: "3.66" },
      { k: "awards", v: "Director's List ×2" },
      { k: "research", v: "2 ongoing" },
    ],
    cur: true,
  },
  {
    when: "2022 — 2024",
    role: "Freelance Web Developer",
    at: "Remote",
    notes:
      "Delivered Laravel-based CMS and web applications for multiple clients. Owned backend architecture, deployment, and ongoing maintenance. Improved client search visibility through SEO best practices and structured data markup.",
    commits: [
      { k: "stack", v: "Laravel + PHP" },
      { k: "focus", v: "CMS & web apps" },
      { k: "extras", v: "SEO + performance" },
    ],
  },

];

export const now = {
  procs: [
    {
      pid: "0x01",
      cmd: "research",
      arg: "--topic ddos-autoscaling --status ongoing",
      cpu: "62%",
      mem: "2G",
      hot: true,
    },
    {
      pid: "0x02",
      cmd: "research",
      arg: "--topic syn-packet-dpi-bypass --status ongoing",
      cpu: "45%",
      mem: "1G",
      hot: true,
    },
    {
      pid: "0x03",
      cmd: "study",
      arg: "UCSC Year 3 Semester 1",
      cpu: "80%",
      mem: "4G",
    },
    {
      pid: "0x04",
      cmd: "homelab",
      arg: "--cluster k8s --status running --uptime 47d",
      cpu: "12%",
      mem: "512M",
    },
    {
      pid: "0x05",
      cmd: "read",
      arg: "Computer Networking: A Top-Down Approach",
      cpu: "3%",
      mem: "64M",
    },
    {
      pid: "0x06",
      cmd: "brew",
      arg: "--method v60 --beans local-roast",
      cpu: "70%",
      mem: "∞",
    },
  ] as Proc[],
  reading: [
    { state: "cur", t: "Computer Networking: A Top-Down Approach", by: "Kurose & Ross" },
    { state: "cur", t: "Cloud Native DevOps with Kubernetes", by: "Arundel & Domingus" },
    { state: "done", t: "The Phoenix Project", by: "Gene Kim et al." },
    { state: "todo", t: "Designing Data-Intensive Applications", by: "Martin Kleppmann" },
    { state: "todo", t: "Clean Architecture", by: "Robert C. Martin" },
  ],
  inbox: [
    {
      who: "ucsc-portal",
      subj: "Semester results: GPA 3.66 maintained",
      when: "2d",
      sev: "LO",
    },
    {
      who: "github-actions",
      subj: "homelab CI: cluster health check green",
      when: "4h",
      sev: "LO",
    },
    {
      who: "research-supervisor",
      subj: "DDoS autoscaling: feedback on methodology draft",
      when: "1d",
      sev: "MD",
    },
    {
      who: "arxiv",
      subj: "Daily digest: cs.NI + cs.CR (18 papers)",
      when: "6h",
      sev: "LO",
    },
  ],
};

export const ticker = [
  { src: "homelab", msg: "k8s cluster health: all nodes ready, uptime 47d" },
  { src: "research", msg: "ddos-autoscaling: methodology draft in review" },
  { src: "github", msg: "smile: PR merged — AI recommendation engine v2" },
  { src: "ucsc", msg: "GPA: 3.66 — Director’s List 2023 & 2024" },
  { src: "research", msg: "syn-dpi-bypass: feasibility analysis 60% complete" },
  { src: "github", msg: "pixel-ai: Ballerina API exam module deployed" },
  { src: "homelab", msg: "grafana: 0 critical alerts, prometheus scrape 30s" },
  { src: "coffee", msg: "v60 #2 brewed, focus level nominal" },
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
