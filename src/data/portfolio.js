export const portfolioData = {
    name: "Thathsara",
    role: "Senior Software Engineer",
    tagline: "Building scalable systems and engaging user experiences.",
    about: "I'm a passionate software engineer with a deep-rooted love for problem-solving and architectural design. Over the years, I've transformed complex requirements into robust, high-performance web applications. When I'm not coding, I'm exploring new technologies or contributing to open-source projects.",
    contact: {
        email: "hello@thathsara.dev",
        github: "https://github.com/thathsara",
        linkedin: "https://linkedin.com/in/thathsara"
    },
    skills: [
        "JavaScript/TypeScript", "React & Next.js", "Node.js", "Python & Go",
        "AWS & Docker", "GraphQL & REST APIs", "PostgreSQL & MongoDB", "System Design"
    ],
    experience: [
        {
            role: "Lead Software Engineer",
            company: "TechNova Solutions",
            period: "2023 - Present",
            description: "Spearheaded the development of a microservices architecture that scaled to handle 5M+ daily active users. Mentored a team of 8 junior to mid-level engineers."
        },
        {
            role: "Full Stack Developer",
            company: "Innovate AI",
            period: "2020 - 2023",
            description: "Built and deployed a suite of internal ML tooling interfaces using React and Python, increasing data annotation efficiency by 40%."
        }
    ],
    projects: [
        {
            title: "TaskFlow: AI Project Management",
            slug: "taskflow-ai",
            description: "A collaborative project management tool that uses machine learning to automatically predict task durations, assign resources based on team workload, and detect potential bottlenecks before they happen. Scaled to support over 10,000 concurrent active users with real-time websocket updates.",
            tech: ["React.js", "Node.js", "PostgreSQL", "Socket.io", "Python (FastAPI)"],
            link: "/projects/taskflow-ai",
            githubLink: "https://github.com/thathsara/taskflow-ai",
            liveLink: "https://taskflow.thathsara.dev",
            details: {
                problem: "Modern project management tools often require heavy manual input for estimating timelines and managing resource allocation. Teams end up spending more time managing the tool than actually doing the work. The goal was to build a system that passively learns from a team's historical velocity and auto-balances workloads.",
                architecture: "The frontend is built with React and utilizes Socket.io for instantaneous collaborative updates (like Google Docs). The primary CRUD backend is a Node.js/Express monolith backed by PostgreSQL. The AI layer is handled by a separate Python microservice running FastAPI, which utilizes a trained RandomForest model to analyze historical completion times and predict future bottlenecks.",
                outcome: "TaskFlow was adopted by 5 internal teams initially, leading to a 30% reduction in time spent in sprint planning meetings. The websocket architecture successfully handled stress tests of up to 10,000 concurrent connections with under 50ms latency."
            }
        },
        {
            title: "FinDash: Crypto & Stock Portfolio",
            slug: "findash",
            description: "A comprehensive financial dashboard that aggregates data from 15+ cryptocurrency and stock market APIs. Features include real-time customizable charting using TradingView libraries, automated portfolio rebalancing suggestions, and tax-loss harvesting calculations.",
            tech: ["Next.js", "TypeScript", "Tailwind CSS", "Redis", "AWS Lambda"],
            link: "/projects/findash",
            githubLink: "https://github.com/thathsara/findash",
            liveLink: "https://findash.thathsara.dev",
            details: {
                problem: "Retail investors often have their assets scattered across multiple brokerages and crypto exchanges, making it difficult to get a unified view of their net worth, aggregate risk exposure, and potential tax-loss harvesting opportunities.",
                architecture: "Built on Next.js utilizing Server-Side Rendering (SSR) for fast initial loads. To handle API rate limits from 15 different financial data providers, I implemented a robust caching layer using Redis. Data fetching and calculation-heavy tasks (like tax-loss harvesting algorithms) are offloaded to AWS Lambda functions via an API Gateway.",
                outcome: "The platform provides a strictly unified view of user assets with sub-second dashboard load times, despite gathering data from over a dozen disparate sources. It successfully processes over 2 million price updates daily."
            }
        },
        {
            title: "E-Commerce Microservices Engine",
            slug: "ecommerce-engine",
            description: "An open-source, head-less e-commerce backend built with an event-driven microservices architecture. Designed for high availability during flash sales, utilizing an event bus to handle inventory reservation, payment processing, and shipping logistics asynchronously.",
            tech: ["Go", "Docker", "Kubernetes", "Apache Kafka", "MongoDB"],
            link: "/projects/ecommerce-engine",
            githubLink: "https://github.com/thathsara/ecommerce-engine",
            liveLink: "https://ecommerce.thathsara.dev",
            details: {
                problem: "Traditional monolithic e-commerce backends often fail under flash-sale conditions due to database locks during synchronous checkout flows. The challenge was to build a completely asynchronous checkout pipeline that could queue thousands of orders per second without dropping a single transactional event.",
                architecture: "This backend is completely headless, built entirely in Go for high concurrency and low memory footprint. It utilizes Apache Kafka as an event bus. When an order is placed, an 'OrderCreated' event is emitted. The Payment, Inventory, and Notification microservices consume this event at their own pace, utilizing the Saga pattern to handle distributed transactions and rollbacks.",
                outcome: "In simulated load testing using k6, the architecture successfully ingested 5,000 orders per second. Infrastructure costs were kept 40% lower compared to similar Node.js setups due to Go's efficient resource utilization inside Kubernetes clusters."
            }
        }
    ]
};