/**
 * OKR Templates - AI-Assisted Goal Setting
 * Inspired by okrstool.com's template system
 */

export interface OKRTemplate {
  id: string;
  type: 'company' | 'department' | 'team' | 'individual'; // OKR scope level
  category: 'growth' | 'product' | 'sales' | 'engineering' | 'marketing' | 'operations';
  title: string;
  description: string;
  objective: string;
  keyResults: string[];
  tags: string[];
  bestFor: string; // Who should use this
  tips?: string;
}

export const OKR_TEMPLATES: OKRTemplate[] = [
  // GROWTH TEMPLATES
  {
    id: 'growth-user-acquisition',
    type: 'company',
    category: 'growth',
    title: 'User Acquisition Growth',
    description: 'Scale user acquisition through multiple channels',
    objective: 'Accelerate user acquisition and expand market reach',
    keyResults: [
      'Increase monthly active users from 10K to 25K',
      'Achieve 15% month-over-month growth in new signups',
      'Launch 3 new acquisition channels with 500+ users each',
      'Reduce customer acquisition cost (CAC) from $50 to $35',
    ],
    tags: ['growth', 'acquisition', 'users', 'marketing'],
    bestFor: 'Growth teams, Marketing leads, Product managers',
    tips: 'Focus on scalable channels and track unit economics closely',
  },
  {
    id: 'growth-retention',
    type: 'company',
    category: 'growth',
    title: 'User Retention & Engagement',
    description: 'Improve user retention and daily engagement',
    objective: 'Build a highly engaged and retained user base',
    keyResults: [
      'Increase Day-30 retention from 35% to 50%',
      'Grow daily active users (DAU) by 40%',
      'Reduce user churn rate from 8% to 5% monthly',
      'Achieve 60% weekly active user rate',
    ],
    tags: ['retention', 'engagement', 'activation', 'product'],
    bestFor: 'Product teams, Growth PMs, Customer Success',
    tips: 'Identify your "aha moment" and optimize time-to-value',
  },
  {
    id: 'growth-revenue',
    type: 'company',
    category: 'growth',
    title: 'Revenue Growth',
    description: 'Drive revenue through conversion and expansion',
    objective: 'Accelerate revenue growth through conversion optimization',
    keyResults: [
      'Grow monthly recurring revenue (MRR) from $100K to $150K',
      'Increase free-to-paid conversion rate from 3% to 5%',
      'Expand average revenue per user (ARPU) by 25%',
      'Close 20 enterprise deals worth $5K+ each',
    ],
    tags: ['revenue', 'monetization', 'conversion', 'sales'],
    bestFor: 'Sales teams, Revenue leads, Growth teams',
    tips: 'Balance acquisition, activation, and monetization efforts',
  },

  // PRODUCT TEMPLATES
  {
    id: 'product-launch',
    type: 'department',
    category: 'product',
    title: 'New Product Launch',
    description: 'Successfully launch a new product or major feature',
    objective: 'Launch [Product Name] and achieve product-market fit',
    keyResults: [
      'Ship MVP with 5 core features by end of quarter',
      'Acquire 1,000 early adopters within first month',
      'Achieve 40+ NPS score from beta users',
      'Generate 500 qualified leads from product launch',
    ],
    tags: ['launch', 'mvp', 'product', 'feature'],
    bestFor: 'Product managers, Engineering leads, Founders',
    tips: 'Start small, iterate fast, and listen to user feedback',
  },
  {
    id: 'product-quality',
    type: 'team',
    category: 'product',
    title: 'Product Quality & Performance',
    description: 'Improve product reliability and user experience',
    objective: 'Deliver a fast, reliable, and delightful product experience',
    keyResults: [
      'Reduce app crash rate from 2% to 0.5%',
      'Improve page load time from 3s to under 1s',
      'Achieve 99.9% uptime (< 45min downtime/month)',
      'Increase product satisfaction score from 7.5 to 8.5/10',
    ],
    tags: ['quality', 'performance', 'reliability', 'ux'],
    bestFor: 'Engineering teams, Product managers, QA leads',
    tips: 'Monitor real user metrics and prioritize high-impact fixes',
  },
  {
    id: 'product-innovation',
    type: 'team',
    category: 'product',
    title: 'Product Innovation',
    description: 'Drive innovation through experimentation',
    objective: 'Foster innovation through rapid experimentation',
    keyResults: [
      'Run 12 product experiments with clear hypotheses',
      'Launch 3 validated features from experiments',
      'Achieve 20% improvement in key engagement metric',
      'Collect 200+ user feedback sessions',
    ],
    tags: ['innovation', 'experimentation', 'testing', 'research'],
    bestFor: 'Product teams, Design teams, Innovation labs',
    tips: 'Fail fast, learn faster - not all experiments will succeed',
  },

  // SALES TEMPLATES
  {
    id: 'sales-pipeline',
    type: 'department',
    category: 'sales',
    title: 'Sales Pipeline Growth',
    description: 'Build a healthy and predictable sales pipeline',
    objective: 'Build a robust sales pipeline to hit revenue targets',
    keyResults: [
      'Generate 150 qualified leads per month',
      'Achieve $500K in pipeline value',
      'Increase lead-to-opportunity conversion from 20% to 30%',
      'Maintain 3x pipeline coverage ratio',
    ],
    tags: ['pipeline', 'leads', 'sales', 'prospecting'],
    bestFor: 'Sales teams, SDRs, Sales managers',
    tips: 'Focus on lead quality over quantity for sustainable growth',
  },
  {
    id: 'sales-conversion',
    type: 'department',
    category: 'sales',
    title: 'Sales Conversion Optimization',
    description: 'Improve win rates and deal velocity',
    objective: 'Optimize sales process to close deals faster',
    keyResults: [
      'Increase win rate from 25% to 35%',
      'Reduce average sales cycle from 60 to 45 days',
      'Grow average deal size from $10K to $15K',
      'Achieve 90% quota attainment across team',
    ],
    tags: ['conversion', 'closing', 'sales', 'efficiency'],
    bestFor: 'Account executives, Sales managers, RevOps',
    tips: 'Identify and remove bottlenecks in your sales process',
  },

  // ENGINEERING TEMPLATES
  {
    id: 'engineering-velocity',
    type: 'team',
    category: 'engineering',
    title: 'Engineering Velocity',
    description: 'Increase development speed and efficiency',
    objective: 'Accelerate engineering velocity while maintaining quality',
    keyResults: [
      'Increase deployment frequency from weekly to daily',
      'Reduce PR review time from 24h to 4h average',
      'Achieve 80% test coverage across codebase',
      'Complete 30 story points per sprint consistently',
    ],
    tags: ['velocity', 'productivity', 'engineering', 'devops'],
    bestFor: 'Engineering managers, Tech leads, DevOps teams',
    tips: 'Automate repetitive tasks and invest in developer tooling',
  },
  {
    id: 'engineering-technical-debt',
    type: 'team',
    category: 'engineering',
    title: 'Technical Debt Reduction',
    description: 'Pay down technical debt and improve code health',
    objective: 'Reduce technical debt and improve system maintainability',
    keyResults: [
      'Refactor 5 critical legacy modules',
      'Reduce code complexity score from 8 to 5',
      'Eliminate 100 high-priority tech debt items',
      'Decrease bug backlog by 50%',
    ],
    tags: ['technical-debt', 'refactoring', 'quality', 'maintenance'],
    bestFor: 'Engineering teams, Tech leads, Platform teams',
    tips: 'Balance new features with maintenance - allocate 20% time',
  },
  {
    id: 'engineering-infrastructure',
    type: 'department',
    category: 'engineering',
    title: 'Infrastructure & Scalability',
    description: 'Build scalable and reliable infrastructure',
    objective: 'Build infrastructure to support 10x growth',
    keyResults: [
      'Scale system to handle 1M requests per minute',
      'Reduce infrastructure costs by 30% through optimization',
      'Achieve 99.95% service availability',
      'Implement auto-scaling for all critical services',
    ],
    tags: ['infrastructure', 'scalability', 'performance', 'devops'],
    bestFor: 'Platform engineers, SRE teams, Infrastructure teams',
    tips: 'Design for failure and implement proper monitoring',
  },

  // MARKETING TEMPLATES
  {
    id: 'marketing-brand-awareness',
    type: 'department',
    category: 'marketing',
    title: 'Brand Awareness Campaign',
    description: 'Increase brand visibility and recognition',
    objective: 'Establish strong brand presence in target market',
    keyResults: [
      'Grow social media following by 10K followers',
      'Achieve 2M impressions on content campaigns',
      'Increase branded search volume by 50%',
      'Secure 10 media mentions in industry publications',
    ],
    tags: ['brand', 'awareness', 'marketing', 'content'],
    bestFor: 'Marketing teams, Brand managers, Content leads',
    tips: 'Create consistent, valuable content that resonates with your ICP',
  },
  {
    id: 'marketing-content',
    type: 'department',
    category: 'marketing',
    title: 'Content Marketing Growth',
    description: 'Drive organic traffic through content',
    objective: 'Scale content marketing for lead generation',
    keyResults: [
      'Publish 40 high-quality blog posts',
      'Grow organic traffic from 20K to 50K monthly visits',
      'Generate 500 marketing qualified leads (MQLs) from content',
      'Achieve 10 keywords in top 3 search positions',
    ],
    tags: ['content', 'seo', 'organic', 'inbound'],
    bestFor: 'Content teams, SEO specialists, Marketing managers',
    tips: 'Focus on topics your target audience is actively searching for',
  },

  // OPERATIONS TEMPLATES
  {
    id: 'operations-efficiency',
    type: 'team',
    category: 'operations',
    title: 'Operational Excellence',
    description: 'Streamline operations and reduce costs',
    objective: 'Achieve operational excellence through process optimization',
    keyResults: [
      'Reduce operational costs by 20%',
      'Automate 5 manual processes',
      'Decrease average ticket resolution time from 24h to 8h',
      'Improve team productivity score from 7 to 9/10',
    ],
    tags: ['operations', 'efficiency', 'automation', 'process'],
    bestFor: 'Operations teams, COOs, Process managers',
    tips: 'Map current processes before optimizing - measure everything',
  },

  // SOLUTION COMPANY - BLOCKCHAIN TEMPLATES
  {
    id: 'blockchain-web3-delivery',
    type: 'department',
    category: 'product',
    title: 'Blockchain & Web3 Solution Delivery',
    description: 'Deliver high-quality blockchain projects and Web3 applications',
    objective: 'Become the go-to blockchain solution provider',
    keyResults: [
      'Complete 15 blockchain projects with 95%+ client satisfaction',
      'Launch 5 DeFi applications with 10,000+ total users',
      'Achieve 0 critical security vulnerabilities in smart contracts',
      'Expand multi-chain support to 5 networks (Ethereum, Polygon, Solana, BSC, Avalanche)',
    ],
    tags: ['blockchain', 'web3', 'defi', 'smart-contracts', 'dapp'],
    bestFor: 'Blockchain departments, Web3 teams, Solution architects',
    tips: 'Security first - always conduct thorough audits before deployment',
  },
  {
    id: 'blockchain-smart-contract',
    type: 'team',
    category: 'engineering',
    title: 'Smart Contract Development Excellence',
    description: 'Build secure and efficient smart contracts',
    objective: 'Deliver production-ready smart contracts with zero vulnerabilities',
    keyResults: [
      'Deploy 12 audited smart contracts to mainnet',
      'Achieve 100% test coverage on all contracts',
      'Pass 6 third-party security audits with no high-severity issues',
      'Reduce average gas costs by 30% through optimization',
    ],
    tags: ['smart-contracts', 'solidity', 'security', 'blockchain', 'audit'],
    bestFor: 'Smart contract developers, Blockchain engineers, Security specialists',
    tips: 'Follow best practices: use OpenZeppelin libraries and conduct peer reviews',
  },
  {
    id: 'blockchain-dapp-frontend',
    type: 'team',
    category: 'product',
    title: 'DApp Frontend Development',
    description: 'Build exceptional Web3 user experiences',
    objective: 'Create seamless Web3 frontend experiences',
    keyResults: [
      'Launch 6 DApp frontends with <2s load time',
      'Integrate 5 wallet providers (MetaMask, WalletConnect, Coinbase, Trust, Phantom)',
      'Achieve 90%+ lighthouse score on all Web3 applications',
      'Implement Web3 onboarding flow with 70%+ completion rate',
    ],
    tags: ['dapp', 'web3', 'frontend', 'wallet', 'ux'],
    bestFor: 'Frontend teams, Web3 developers, UX designers',
    tips: 'Focus on wallet connection UX - it\'s often the first interaction',
  },

  // SOLUTION COMPANY - AI/ML TEMPLATES
  {
    id: 'ai-ml-solution-delivery',
    type: 'department',
    category: 'engineering',
    title: 'AI/ML Solution Implementation',
    description: 'Deliver AI/ML solutions that drive client success',
    objective: 'Build cutting-edge AI/ML solutions for clients',
    keyResults: [
      'Deploy 10 ML models to production with >85% accuracy',
      'Complete 12 AI implementation projects on time',
      'Achieve 90+ NPS from AI/ML clients',
      'Reduce model training time by 40% through MLOps',
    ],
    tags: ['ai', 'machine-learning', 'ml', 'data-science', 'mlops'],
    bestFor: 'AI departments, Data science teams, ML engineers',
    tips: 'Focus on MLOps early - deployment is as important as model accuracy',
  },
  {
    id: 'ai-ml-model-development',
    type: 'team',
    category: 'engineering',
    title: 'ML Model Development & Deployment',
    description: 'Build and deploy production-ready ML models',
    objective: 'Deliver high-accuracy ML models at scale',
    keyResults: [
      'Train and deploy 8 models with >90% precision/recall',
      'Implement automated model retraining pipeline',
      'Reduce model inference latency to <100ms',
      'Achieve 99.9% model serving uptime',
    ],
    tags: ['ml-models', 'training', 'deployment', 'inference', 'mlops'],
    bestFor: 'ML engineers, Data scientists, MLOps teams',
    tips: 'Monitor model drift and implement A/B testing for new models',
  },
  {
    id: 'ai-data-pipeline',
    type: 'team',
    category: 'engineering',
    title: 'AI Data Pipeline & Infrastructure',
    description: 'Build robust data infrastructure for AI/ML',
    objective: 'Create scalable and efficient AI data infrastructure',
    keyResults: [
      'Process 1TB+ of data daily with <1% error rate',
      'Reduce data pipeline runtime by 50%',
      'Implement data versioning for 100% of ML datasets',
      'Achieve 99.95% data pipeline uptime',
    ],
    tags: ['data-pipeline', 'etl', 'infrastructure', 'data-engineering'],
    bestFor: 'Data engineers, Platform teams, MLOps engineers',
    tips: 'Data quality is critical - implement validation at every stage',
  },

  // SOLUTION COMPANY - CLOUD/INFRASTRUCTURE TEMPLATES
  {
    id: 'cloud-transformation',
    type: 'department',
    category: 'engineering',
    title: 'Cloud Transformation & Migration',
    description: 'Lead cloud migration and transformation projects',
    objective: 'Deliver seamless cloud transformations for clients',
    keyResults: [
      'Migrate 20 client applications to cloud with 99.9% uptime',
      'Reduce client infrastructure costs by average 35%',
      'Achieve AWS/Azure advanced partner status',
      'Complete 15 DevOps transformation projects',
    ],
    tags: ['cloud', 'migration', 'aws', 'azure', 'transformation'],
    bestFor: 'Cloud departments, DevOps teams, Infrastructure leads',
    tips: 'Plan migration in phases - minimize downtime and risk',
  },
  {
    id: 'cloud-devops-excellence',
    type: 'team',
    category: 'engineering',
    title: 'DevOps & CI/CD Excellence',
    description: 'Build automated and reliable DevOps pipelines',
    objective: 'Achieve DevOps excellence through automation',
    keyResults: [
      'Reduce deployment time from 2 hours to 15 minutes',
      'Achieve 95%+ deployment success rate',
      'Implement CI/CD for 100% of client projects',
      'Automate 80% of infrastructure provisioning',
    ],
    tags: ['devops', 'cicd', 'automation', 'deployment', 'kubernetes'],
    bestFor: 'DevOps engineers, Platform teams, SRE teams',
    tips: 'Infrastructure as Code (IaC) is essential - use Terraform or Pulumi',
  },
  {
    id: 'cloud-infrastructure-reliability',
    type: 'team',
    category: 'engineering',
    title: 'Cloud Infrastructure Reliability',
    description: 'Maintain highly available and secure cloud infrastructure',
    objective: 'Ensure world-class infrastructure reliability and security',
    keyResults: [
      'Achieve 99.95% infrastructure uptime across all clients',
      'Pass 100% of security compliance audits (SOC 2, ISO 27001)',
      'Reduce mean time to recovery (MTTR) to <30 minutes',
      'Implement disaster recovery for all critical systems',
    ],
    tags: ['reliability', 'sre', 'security', 'compliance', 'monitoring'],
    bestFor: 'SRE teams, Infrastructure teams, Security teams',
    tips: 'Design for failure - chaos engineering helps find issues before clients do',
  },
];

// Helper functions for template search and filtering
export function getTemplatesByCategory(category: OKRTemplate['category']): OKRTemplate[] {
  return OKR_TEMPLATES.filter(t => t.category === category);
}

export function searchTemplates(query: string): OKRTemplate[] {
  const lowerQuery = query.toLowerCase();
  return OKR_TEMPLATES.filter(
    t =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.objective.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getTemplateById(id: string): OKRTemplate | undefined {
  return OKR_TEMPLATES.find(t => t.id === id);
}

export const TEMPLATE_CATEGORIES = [
  { value: 'growth', label: 'Growth', icon: '📈', color: 'bg-green-100 text-green-700' },
  { value: 'product', label: 'Product', icon: '🚀', color: 'bg-blue-100 text-blue-700' },
  { value: 'sales', label: 'Sales', icon: '💰', color: 'bg-purple-100 text-purple-700' },
  { value: 'engineering', label: 'Engineering', icon: '⚙️', color: 'bg-slate-100 text-slate-700' },
  { value: 'marketing', label: 'Marketing', icon: '📣', color: 'bg-pink-100 text-pink-700' },
  { value: 'operations', label: 'Operations', icon: '⚡', color: 'bg-amber-100 text-amber-700' },
] as const;
