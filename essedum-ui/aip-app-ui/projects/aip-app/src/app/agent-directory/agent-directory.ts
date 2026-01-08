export class AgentDirectory {
  id: number;
  alias: string;
  name: string;
  type: string;
  description: string;
  connectionDetails: string;
  organization: string;
  lastmodifiedby: string;
  lastmodifieddate: any;
  category: string;
  extras_json: any;
  interfacetype: string;
  
  // OASF Required Fields
  version: string;
  cid: string;
  previous_record_cid: string; // Links to previous version
  
  // OASF Optional but Recommended Fields
  creator: string;
  
  // OASF Collections
  modules: Array<{ name: string }>;
  skills: Array<{ name: string }>;
  domains: Array<{ name: string; description: string }>;
  locators: Array<{ locator_type: string; url: string }>;
  syncs: Array<{ target: string; frequency: string; last_sync: string }>;
  publications: Array<{ channel: string; published_date: string; status: string }>;
  extensions: Array<{ ext_key: string; ext_value: string; description: string }>;
  selectors: Array<{ sel_key: string; sel_value: string }>;
  signatures: Array<{ algorithm: string; value: string; certificate: string }>;
  tools: Array<{ name: string; description: string; parameters: Array<{ name: string; param_type: string; description: string }> }>;
  resources: Array<{ name: string; description: string; url: string }>;
  prompts: Array<{ name: string; description: string }>;

  constructor(json?: any) {
    if (json != null) {
      this.initializeBasicFields(json);
      this.initializeOasfFields(json);
    }
  }

  private initializeBasicFields(json: any): void {
    this.id = json.id ? json.id : 0;
    this.alias = json.alias;
    this.name = json.name;
    this.type = json.type;
    this.description = json.description;
    this.connectionDetails = json.connectionDetails;
    this.organization = json.organization;
    this.lastmodifiedby = json.lastmodifiedby;
    this.lastmodifieddate = json.lastmodifieddate;
    this.category = json.category;
    this.extras_json = json.extras;
    this.interfacetype = json.interfacetype;
  }

  private initializeOasfFields(json: any): void {
    this.version = json.version || '1.0.0';
    this.cid = json.cid || '';
    this.previous_record_cid = json.previous_record_cid || '';
    this.creator = json.creator || '';
    this.modules = json.modules || [];
    this.skills = json.skills || [];
    this.domains = json.domains || [];
    this.locators = json.locators || [];
    this.syncs = json.syncs || [];
    this.publications = json.publications || [];
    this.extensions = json.extensions || [];
    this.selectors = json.selectors || [];
    this.signatures = json.signatures || [];
    this.tools = json.tools || [];
    this.resources = json.resources || [];
    this.prompts = json.prompts || [];
  }

  // Utils

  static toArray(jsons: any[]): AgentDirectory[] {
    const agents: AgentDirectory[] = [];
    if (jsons != null) {
      for (const json of jsons) {
        agents.push(new AgentDirectory(json));
      }
    }
    return agents;
  }
}

export const mockDataAgentDirectory = [
  {
    activetime: '2025-05-26 11:10:16',
    alias: 'infermedica/medical-triage-agent',
    category: 'Agent',
    connectionDetails: null,
    description: 'Medical triage AI agent for preliminary health assessments',
    dshashcode:
      '9c360ba8e41e645e3afbdd6d26ad0f071abfa9c4cc6508e835a9e0743d627e92',
    extras: null,
    foradapter: true,
    forapp: false,
    fordataset: false,
    forendpoint: false,
    formodel: false,
    forpromptprovider: false,
    forruntime: false,
    id: 6332,
    interfacetype: "pipeline-agent",
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Mon May 26 2025 16:40:17 GMT+0530'),
    name: 'LEOSMPL-36919',
    organization: 'leo1311',
    salt: null,
    type: 'AIAgent',
    // ✅ IMPROVED: Skills now use object format for consistency
    skills: [
      { name: 'language' },
      { name: 'medical-diagnosis' },
      { name: 'symptom-analysis' }
    ],
    // OASF Fields
    version: '1.2.0',
    cid: 'bafy2bzacedkwyjnj7gd2xqxhtamdxhxlbucfjsgk4zzvdp7p4wvqq3r5mmwlg',
    previous_record_cid: 'bafy2bzaced5abc123previousversion1point1medicalagent789xyz',
    creator: 'infermedica-ai-team',
    modules: [
      { name: 'Symptom Checker Module' },
      { name: 'Medical Knowledge Base' }
    ],
    domains: [
      { name: 'Healthcare', description: 'Medical triage and preliminary diagnosis' },
      { name: 'Natural Language Processing', description: 'Understanding patient symptoms' }
    ],
    locators: [
      { locator_type: 'source-code', url: 'https://github.com/infermedica/medical-agent' },
      { locator_type: 'api', url: 'https://api.infermedica.com/v3/triage' },
      { locator_type: 'oci-image', url: 'ghcr.io/infermedica/medical-triage:v1.2.0' }
    ],
    syncs: [
      { target: 'production-health-cluster', frequency: 'hourly', last_sync: '2025-05-26T10:00:00Z' },
      { target: 'backup-medical-db', frequency: 'daily', last_sync: '2025-05-26T02:00:00Z' }
    ],
    publications: [
      { channel: 'GitHub Registry', published_date: '2025-05-20', status: 'published' },
      { channel: 'Docker Hub', published_date: '2025-05-20', status: 'published' }
    ],
    extensions: [
      { ext_key: 'compliance_level', ext_value: 'HIPAA', description: 'Healthcare data compliance certification' },
      { ext_key: 'deployment_region', ext_value: 'us-east-1', description: 'Primary deployment region' },
      { ext_key: 'cost_center', ext_value: 'Healthcare-AI', description: 'Budget allocation' }
    ],
    selectors: [
      { sel_key: 'environment', sel_value: 'production' },
        { sel_key: 'tier', sel_value: 'enterprise' },
      { sel_key: 'specialty', sel_value: 'medical' }
    ],
    signatures: [
      {
        algorithm: 'SHA2_256',
        value: 'MEUCIQD5XvK3jY8mN2fL9pWnH4sR7tQ6xZ8vB1kC2hD9eF0gA==',
        certificate: 'MIICyDCCAjKgAwIBAgIJAK8wF5xR6L3dMA0GCSqGSIb3DQEBCwUAMIGKMQswCQYDVQQG'
      }
    ],
    tools: [
      {
        name: 'check-symptoms',
        description: 'Analyzes patient symptoms and provides triage recommendations',
        parameters: [
          { name: 'symptoms', type: 'array', description: 'List of patient symptoms' },
          { name: 'age', type: 'number', description: 'Patient age in years' },
          { name: 'sex', type: 'string', description: 'Patient biological sex' }
        ]
      }
    ],
    resources: [
      { name: 'API Documentation', description: 'Medical triage API reference', url: 'https://docs.infermedica.com' },
      { name: 'User Guide', description: 'Integration guide for healthcare providers', url: 'https://docs.infermedica.com/guide' }
    ],
    prompts: [
      { name: 'greeting', description: 'Hello! I can help you assess your symptoms. Please describe what you\'re experiencing.' },
      { name: 'follow-up', description: 'Based on your symptoms, I need to ask a few more questions to provide better guidance.' }
    ],
    extras_json: {
      name: 'medical-triage-agent',
      version: '1.2.0',
      description: 'AI-powered medical triage assistant for preliminary symptom assessment',
      capabilities: ['symptom-analysis', 'medical-triage', 'healthcare-guidance'],
      compliance: {
        hipaa: true,
        certifications: ['SOC2', 'ISO27001'],
        dataRetention: '90-days'
      },
      configuration: {
        language: 'multi-language',
        specialty: 'general-medicine',
        knowledgeBase: 'medical-ontology-v3',
        apiEndpoint: 'https://api.infermedica.com/v3/triage'
      },
      integrations: {
        ehr: ['Epic', 'Cerner', 'Allscripts'],
        telehealth: ['Teladoc', 'Amwell'],
        analytics: ['Healthcare-AI-Platform']
      }
    }
  },
  {
    activetime: '2025-05-27 12:15:20',
    alias: 'cnoe-io/agent-backstage',
    category: 'Agent',
    connectionDetails: null,
    description: 'Developer portal agent for platform engineering',
    dshashcode: 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890ab',
    extras: null,
    foradapter: false,
    forapp: true,
    fordataset: false,
    forendpoint: true,
    formodel: false,
    forpromptprovider: false,
    forruntime: false,
    id: 6333,
    interfacetype: 'pipeline-agent',
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Tue May 27 2025 17:45:30 GMT+0530'),
    name: 'TESTAPI-12345',
    organization: 'leo1311',
    salt: null,
    type: 'AIAgent',
    skills: [
      { name: 'language' },
      { name: 'platform-engineering' },
      { name: 'service-catalog' }
    ],
    // OASF Fields
    version: '2.0.1',
    cid: 'bafy2bzacedbfq2tn5y4m6wqxt3zqnp7u8r9s6t5v4x3y2z1qwertysdfghjkl',
    previous_record_cid: 'bafy2bzacedb1point9backstagepreviousversionxyz123abc456',
    creator: 'cnoe-community',
    modules: [
      { name: 'Service Catalog' },
      { name: 'Developer Portal' },
      { name: 'API Integration' }
    ],
    domains: [
      { name: 'Platform Engineering', description: 'Internal developer platforms and tooling' },
      { name: 'Service Management', description: 'Microservices catalog and documentation' }
    ],
    locators: [
      { locator_type: 'source-code', url: 'https://github.com/cnoe-io/backstage-agent' },
      { locator_type: 'endpoint', url: 'https://backstage.cnoe.io/api' },
      { locator_type: 'documentation', url: 'https://backstage.cnoe.io/docs' }
    ],
    syncs: [
      { target: 'k8s-cluster-prod', frequency: 'real-time', last_sync: '2025-05-27T12:00:00Z' }
    ],
    publications: [
      { channel: 'Internal Registry', published_date: '2025-05-25', status: 'published' },
      { channel: 'GitHub Releases', published_date: '2025-05-25', status: 'published' }
    ],
    extensions: [
      { ext_key: 'deployment_type', ext_value: 'kubernetes', description: 'Container orchestration platform' },
      { ext_key: 'cost_center', ext_value: 'Platform-Ops', description: 'Operations budget allocation' },
      { ext_key: 'support_level', ext_value: 'tier-1', description: '24/7 support availability' }
    ],
    selectors: [
      { sel_key: 'environment', sel_value: 'production' },
      { sel_key: 'platform', sel_value: 'kubernetes' },
      { sel_key: 'category', sel_value: 'developer-tools' }
    ],
    signatures: [
      {
        algorithm: 'SHA2_512',
        value: 'MEYCIQC8YvN4kP9oM3nF8rWxI5tS8uR7yA9wC2lD3iE4fG5hBwIhAPQ9ZwM5jN==',
        certificate: 'MIIDxTCCAq2gAwIBAgIJAL9xG6yS7M4eMA0GCSqGSIb3DQEBCwUAMIGNMQswCQYD'
      }
    ],
    tools: [
      {
        name: 'list-services',
        description: 'Lists all registered services in the catalog',
        parameters: [
          { name: 'filter', type: 'string', description: 'Optional filter by service type' },
          { name: 'limit', type: 'number', description: 'Maximum number of results' }
        ]
      },
      {
        name: 'create-service',
        description: 'Registers a new service in the platform',
        parameters: [
          { name: 'name', type: 'string', description: 'Service name' },
          { name: 'repository', type: 'string', description: 'Git repository URL' },
          { name: 'owner', type: 'string', description: 'Team owning the service' }
        ]
      }
    ],
    resources: [
      { name: 'Platform Guide', description: 'Developer platform onboarding guide', url: 'https://docs.cnoe.io/guide' },
      { name: 'API Reference', description: 'Complete API documentation', url: 'https://api.cnoe.io/docs' }
    ],
    prompts: [
      { name: 'welcome', description: 'Welcome to the developer portal. Browse our service catalog or register a new service.' },
      { name: 'help', description: 'Use /services to list all available services, or /register to add a new one.' }
    ],
     extras_json: {
      name: 'testing',
      version: '1.2.0',
      description: 'AI-powered medical triage assistant for preliminary symptom assessment',
      capabilities: ['symptom-analysis', 'medical-triage', 'healthcare-guidance'],
      
    }
  },

  {
    activetime: '2025-05-28 09:30:45',
    alias: 'Mcoffeeagntcy/mcp-weather',
    category: 'mcpServer',
    description: 'Weather forecast mcpServer server providing real-time weather data and alerts',
    dshashcode: 'f9e8d7c6b5a49876543210987654321fedcba0987654321fedcba09876',
    extras: null,
    foradapter: false,
    forapp: false,
    fordataset: false,
    forendpoint: false,
    formodel: true,
    forpromptprovider: false,
    forruntime: true,
    id: 6334,
    interfacetype: 'gRPC',
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Wed May 28 2025 14:20:10 GMT+0530'),
    name: 'MLMODEL-56789',
    organization: 'leo1311',
    salt: null,
    type: 'mcpServer',
    skills: [
      { name: 'weather-data' },
      { name: 'forecasting' },
      { name: 'real-time-alerts' }
    ],
    // OASF Fields
    version: '1.5.3',
    cid: 'bafy2bzacedmmzn8k9p0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f',
    creator: 'mcoffee-agntcy',
    modules: [
      { name: 'Weather Data Fetcher' },
      { name: 'Forecast Engine' },
      { name: 'Alert System' }
    ],
    domains: [
      { name: 'Weather Services', description: 'Real-time weather data and forecasting' },
      { name: 'Alert Management', description: 'Weather alert notifications and monitoring' }
    ],
    locators: [
      { locator_type: 'source-code', url: 'https://github.com/mcoffeeagntcy/mcp-weather' },
      { locator_type: 'oci-image', url: 'ghcr.io/mcoffeeagntcy/mcp-weather:v1.5.3' },
      { locator_type: 'endpoint', url: 'grpc://weather.mcoffee.io:50051' }
    ],
    syncs: [
      { target: 'weather-api-upstream', frequency: 'real-time', last_sync: '2025-05-28T09:30:00Z' },
      { target: 'cache-server', frequency: 'hourly', last_sync: '2025-05-28T09:00:00Z' }
    ],
    publications: [
      { channel: 'GitHub Container Registry', published_date: '2025-05-27', status: 'published' },
      { channel: 'mcpServer Directory', published_date: '2025-05-27', status: 'published' },
      { channel: 'Internal Registry', published_date: '2025-05-28', status: 'draft' }
    ],
    extensions: [
      { ext_key: 'data_source', ext_value: 'NOAA', description: 'National Oceanic and Atmospheric Administration' },
      { ext_key: 'update_frequency', ext_value: 'every-5-minutes', description: 'Weather data refresh rate' },
      { ext_key: 'coverage', ext_value: 'US-only', description: 'Geographic coverage area' }
    ],
    selectors: [
      { sel_key: 'protocol', sel_value: 'grpc' },
      { sel_key: 'data-type', sel_value: 'weather' },
      { sel_key: 'region', sel_value: 'us' }
    ],
    signatures: [
      {
        algorithm: 'SHA3_256',
        value: 'MEUCIQDM8FpP5kQ0nO4mG9sX yI6uT9vS8zA0xD3lE5gH6jCxBwIgAQR0awN6k==',
        certificate: 'MIIEyTCCA7GgAwIBAgIKBwxH7yT8N5feMB0GCSqGSIb3DQEBDQUAMIGOMQ swCQYD'
      }
    ],
    tools: [
      {
        name: 'get-forecast',
        description: 'Retrieves detailed weather forecast for a specified US location',
        parameters: [
          { name: 'latitude', type: 'number', description: 'Latitude of the location (-90 to 90)' },
          { name: 'longitude', type: 'number', description: 'Longitude of the location (-180 to 180)' },
          { name: 'days', type: 'number', description: 'Number of forecast days (1-7)' }
        ]
      },
      {
        name: 'get-alerts',
        description: 'Retrieves active weather alerts for a specified US state',
        parameters: [
          { name: 'state', type: 'string', description: 'Two-letter US state code (e.g., CA, NY)' }
        ]
      },
      {
        name: 'get-current',
        description: 'Gets current weather conditions for a location',
        parameters: [
          { name: 'zipcode', type: 'string', description: 'US ZIP code' }
        ]
      }
    ],
    resources: [
      { name: 'mcpServer Documentation', description: 'Official mcpServer Weather Server documentation', url: 'https://docs.mcoffee.io/mcp-weather' },
      { name: 'API Examples', description: 'Code samples and integration examples', url: 'https://github.com/mcoffeeagntcy/mcp-weather/examples' },
      { name: 'Data Sources', description: 'Information about weather data sources', url: 'https://docs.mcoffee.io/data-sources' }
    ],
    prompts: [
      { name: 'help', description: 'Available commands: /forecast, /alerts, /current. Provide location details for weather information.' },
      { name: 'error', description: 'Unable to fetch weather data. Please check location parameters and try again.' },
      { name: 'welcome', description: 'Welcome to mcpServer Weather Server. Get forecasts, alerts, and current conditions for any US location.' }
    ],
    extras_json: {
      name: 'mcp-weather',
      version: '1.5.3',
      description: 'Weather forecast mcpServer server providing real-time weather data and alerts',
      capabilities: ['weather-forecasting', 'alert-monitoring', 'real-time-data'],
      configuration: {
        dataSource: 'NOAA',
        updateFrequency: 'every-5-minutes',
        coverage: 'US-only',
        protocol: 'grpc',
        endpoint: 'grpc://weather.mcoffee.io:50051'
      },
      tools: [
        {
          name: 'get-forecast',
          inputSchema: {
            type: 'object',
            properties: {
              latitude: { type: 'number', minimum: -90, maximum: 90 },
              longitude: { type: 'number', minimum: -180, maximum: 180 },
              days: { type: 'number', minimum: 1, maximum: 7 }
            },
            required: ['latitude', 'longitude']
          }
        },
        {
          name: 'get-alerts',
          inputSchema: {
            type: 'object',
            properties: {
              state: { type: 'string', pattern: '^[A-Z]{2}$' }
            },
            required: ['state']
          }
        },
        {
          name: 'get-current',
          inputSchema: {
            type: 'object',
            properties: {
              zipcode: { type: 'string', pattern: '^[0-9]{5}$' }
            },
            required: ['zipcode']
          }
        }
      ]
    }
  },
  {
    activetime: '2025-05-29 10:45:22',
    alias: 'agent-repo/smart-assistant',
    category: 'Agent',
    connectionDetails: null,
    description: 'Smart assistant agent with multi-domain capabilities',
    dshashcode: 'b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890bc',
    extras: null,
    foradapter: true,
    forapp: false,
    fordataset: false,
    forendpoint: false,
    formodel: false,
    forpromptprovider: false,
    forruntime: false,
    id: 6335,
    interfacetype: "pipeline-agent",
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Thu May 29 2025 15:30:45 GMT+0530'),
    name: 'SMARTAGT-45678',
    organization: 'leo1311',
    salt: null,
    type: 'AIAgent',
    skills: [
      { name: 'natural language processing' },
      { name: 'machine learning' },
      { name: 'data analysis' }
    ],
    // OASF Fields
    version: '3.1.0',
    cid: 'bafy2bzacecrw9z1y2x3v4u5t6s7r8q9p0o1n2m3l4k5j6i7h8g9f0e1d2c3b',
    creator: 'agent-repo-team',
    modules: [{ name: 'NLP Engine' }, { name: 'ML Core' }],
    domains: [
      { name: 'Natural Language Processing', description: 'Advanced text understanding and generation' },
      { name: 'Machine Learning', description: 'Predictive analytics and pattern recognition' }
    ],
    locators: [
      { locator_type: 'source-code', url: 'https://github.com/agent-repo/smart-assistant' },
      { locator_type: 'oci-image', url: 'ghcr.io/agent-repo/smart-assistant:v3.1.0' }
    ],
    syncs: [{ target: 'ml-training-cluster', frequency: 'daily', last_sync: '2025-05-29T00:00:00Z' }],
    publications: [{ channel: 'GitHub Registry', published_date: '2025-05-28', status: 'published' }],
    extensions: [
      { ext_key: 'ml_framework', ext_value: 'tensorflow', description: 'Machine learning framework used' },
      { ext_key: 'model_version', ext_value: 'v2.4', description: 'ML model version' }
    ],
    selectors: [{ sel_key: 'environment', sel_value: 'staging' }, { sel_key: 'tier', sel_value: 'standard' }],
    signatures: [{
      algorithm: 'RSA',
      value: 'MEUCIQDa9Xb8Yc9Zd0Ae1Bf2Cg3Dh4Ei5Fj6Gk7Hl8Im9Jn0Ko==',
      certificate: 'MIIFyDCCBLCgAwIBAgIQDvN9kL0pT1qR2sW3tU4vMzANBgkqhkiG9w0BAQsFADB'
    }],
    tools: [{
      name: 'analyze-text',
      description: 'Analyzes text for sentiment and entities',
      parameters: [{ name: 'text', type: 'string', description: 'Text to analyze' }]
    }],
    resources: [{ name: 'Documentation', description: 'Smart assistant API docs', url: 'https://docs.agent-repo.com' }],
    prompts: [{ name: 'greeting', description: 'Hello! I\'m your smart assistant. How can I help you today?' }],
    extras_json: {
      name: 'testing 5',
      version: '1.2.0',
      description: 'AI-powered medical triage assistant for preliminary symptom assessment',
      capabilities: ['symptom-analysis', 'medical-triage', 'healthcare-guidance'],
      
    }
  },
  {
    activetime: '2025-05-30 14:20:33',
    alias: 'ai-tools/data-analyzer',
    category: 'Agent',
    connectionDetails: null,
    description: 'Data analysis agent with statistical modeling capabilities',
    dshashcode: 'c3d4e5f678901234567890abcdef1234567890abcdef1234567890cd',
    extras: null,
    foradapter: false,
    forapp: true,
    fordataset: true,
    forendpoint: false,
    formodel: false,
    forpromptprovider: false,
    forruntime: false,
    id: 6336,
    interfacetype: 'pipeline-agent',
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Fri May 30 2025 16:50:12 GMT+0530'),
    name: 'DATAAGT-56789',
    organization: 'leo1311',
    salt: null,
    type: 'AIAgent',
    skills: [
      { name: 'machine learning' },
      { name: 'data analysis' },
      { name: 'statistical-modeling' }
    ],
    // OASF Fields
    version: '2.3.1',
    cid: 'bafy2bzaceda8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z',
    creator: 'ai-tools-data-team',
    modules: [{ name: 'Data Processing' }, { name: 'Statistical Engine' }],
    domains: [
      { name: 'Data Analysis', description: 'Statistical analysis and data processing' },
      { name: 'Business Intelligence', description: 'Analytics and reporting' }
    ],
    locators: [
      { locator_type: 'endpoint', url: 'https://api.ai-tools.com/data-analyzer' },
      { locator_type: 'documentation', url: 'https://docs.ai-tools.com/analyzer' }
    ],
    syncs: [{ target: 'data-warehouse', frequency: 'hourly', last_sync: '2025-05-30T14:00:00Z' }],
    publications: [
      { channel: 'API Gateway', published_date: '2025-05-29', status: 'published' },
      { channel: 'Internal Catalog', published_date: '2025-05-30', status: 'draft' }
    ],
    extensions: [
      { ext_key: 'data_retention', ext_value: '90-days', description: 'Data retention policy' },
      { ext_key: 'compliance', ext_value: 'GDPR', description: 'Data privacy compliance' }
    ],
    selectors: [{ sel_key: 'data-type', sel_value: 'analytics' }, { sel_key: 'region', sel_value: 'eu-west' }],
    signatures: [{
      algorithm: 'ECDSA',
      value: 'MEYCIQCz1Aa2Bb3Cc4Dd5Ee6Ff7Gg8Hh9Ii0Jj1Kk2Ll3Mm4Nn5Oo==',
      certificate: 'MIIGyzCCBbOgAwIBAgIRAM5Xp6Yq7R8sT9uV0wX1yZ2cMA0GCSqGSIb3DQEBCwUA'
    }],
    tools: [{
      name: 'analyze-dataset',
      description: 'Performs statistical analysis on datasets',
      parameters: [
        { name: 'dataset_id', type: 'string', description: 'Dataset identifier' },
        { name: 'analysis_type', type: 'string', description: 'Type of analysis to perform' }
      ]
    }],
    resources: [{ name: 'Analysis Guide', description: 'Data analysis best practices', url: 'https://docs.ai-tools.com/guide' }],
    prompts: [{ name: 'help', description: 'Upload your dataset or provide a dataset ID to begin analysis.' }],
    extras_json: {
      name: 'testing 6',
      version: '1.2.0',
      description: 'AI-powered medical triage assistant for preliminary symptom assessment',
      capabilities: ['symptom-analysis', 'medical-triage', 'healthcare-guidance'],
      
    }
  },
  {
    activetime: '2025-05-31 11:55:44',
    alias: 'mcp-server/chatbot',
    category: 'mcpServer',
    description: 'Conversational AI chatbot mcpServer server',
    dshashcode: 'd4e5f678901234567890abcdef1234567890abcdef1234567890de',
    extras: null,
    foradapter: false,
    forapp: false,
    fordataset: false,
    forendpoint: true,
    formodel: false,
    forpromptprovider: true,
    forruntime: false,
    id: 6337,
    interfacetype: 'WebSocket',
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Sat May 31 2025 17:10:25 GMT+0530'),
    name: 'CHATBOT-67890',
    organization: 'leo1311',
    salt: null,
    type: 'mcpServer',
    skills: [
      { name: 'conversational-ai' },
      { name: 'context-management' },
      { name: 'multi-turn-dialogue' }
    ],
    version: '4.0.2',
    cid: 'bafy2bzacedp5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o',
    creator: 'mcp-server-chatbot-team',
    modules: [{ name: 'Dialogue Manager' }, { name: 'Context Engine' }],
    domains: [
      { name: 'Conversational AI', description: 'Natural dialogue and conversation management' },
      { name: 'Customer Support', description: 'Automated customer service interactions' }
    ],
    locators: [
      { locator_type: 'endpoint', url: 'wss://chatbot.mcp-server.io/v1' },
      { locator_type: 'source-code', url: 'https://github.com/mcp-server/chatbot' }
    ],
    syncs: [{ target: 'conversation-history-db', frequency: 'real-time', last_sync: '2025-05-31T11:55:00Z' }],
    publications: [{ channel: 'mcpServer Registry', published_date: '2025-05-30', status: 'published' }],
    extensions: [
      { ext_key: 'max_context_length', ext_value: '4096', description: 'Maximum conversation context tokens' },
      { ext_key: 'languages', ext_value: 'en,es,fr,de', description: 'Supported languages' }
    ],
    selectors: [{ sel_key: 'protocol', sel_value: 'websocket' }, { sel_key: 'use-case', sel_value: 'customer-support' }],
    signatures: [{
      algorithm: 'SHA2_256',
      value: 'MEUCIQDF6Gg7Hh8Ii9Jj0Kk1Ll2Mm3Nn4Oo5Pp6Qq7Rr8Ss9Tt0Uu==',
      certificate: 'MIIHxzCCBq+gAwIBAgITBwAAAABcqTxQR1h1S0AAAAAAADANBgkqhkiG9w0BAQsF'
    }],
    tools: [{
      name: 'send-message',
      description: 'Sends a message to the chatbot and receives a response',
      parameters: [
        { name: 'message', type: 'string', description: 'User message' },
        { name: 'session_id', type: 'string', description: 'Conversation session ID' }
      ]
    }],
    resources: [{ name: 'Integration Guide', description: 'Chatbot integration documentation', url: 'https://docs.mcp-server.io/chatbot' }],
    prompts: [{ name: 'welcome', description: 'Hi! I\'m here to help. What can I assist you with today?' }]
  },
  {
    activetime: '2025-06-01 08:30:55',
    alias: 'agent-hub/voice-assistant',
    category: 'Agent',
    connectionDetails: null,
    description: 'Voice-enabled assistant agent with speech recognition',
    dshashcode: 'e5f678901234567890abcdef1234567890abcdef1234567890ef',
    extras: null,
    foradapter: true,
    forapp: false,
    fordataset: false,
    forendpoint: false,
    formodel: false,
    forpromptprovider: false,
    forruntime: true,
    id: 6338,
    interfacetype: "pipeline-agent",
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Sun Jun 01 2025 18:25:40 GMT+0530'),
    name: 'VOICEAGT-78901',
    organization: 'leo1311',
    salt: null,
    type: 'AIAgent',
    skills: [
      { name: 'language' },
      { name: 'mcpServer server' },
      { name: 'contexual comprehensive' },
      { name: 'framework' },
      { name: 'speech-recognition' },
      { name: 'voice-synthesis' }
    ],
    version: '1.8.5',
    cid: 'bafy2bzaced1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f',
    creator: 'agent-hub-voice-team',
    modules: [{ name: 'Speech Recognition' }, { name: 'Voice Synthesis' }, { name: 'NLU Engine' }],
    domains: [
      { name: 'Voice Interfaces', description: 'Speech recognition and synthesis capabilities' },
      { name: 'Smart Home', description: 'Home automation and IoT control' }
    ],
    locators: [
      { locator_type: 'source-code', url: 'https://github.com/agent-hub/voice-assistant' },
      { locator_type: 'oci-image', url: 'ghcr.io/agent-hub/voice-assistant:v1.8.5' }
    ],
    syncs: [{ target: 'voice-training-data', frequency: 'weekly', last_sync: '2025-06-01T00:00:00Z' }],
    publications: [{ channel: 'GitHub Releases', published_date: '2025-05-31', status: 'published' }],
    extensions: [
      { ext_key: 'voice_model', ext_value: 'whisper-large-v3', description: 'Speech recognition model' },
      { ext_key: 'tts_engine', ext_value: 'elevenlabs', description: 'Text-to-speech engine' }
    ],
    selectors: [{ sel_key: 'interface', sel_value: 'voice' }, { sel_key: 'platform', sel_value: 'cross-platform' }],
    signatures: [{
      algorithm: 'SHA2_512',
      value: 'MEYCIQDh8Ii9Jj0Kk1Ll2Mm3Nn4Oo5Pp6Qq7Rr8Ss9Tt0Uu1Vv2Ww==',
      certificate: 'MIIJyzCCCLOgAwIBAgITEwAAAADdqUy7SR2h2T0AAAAAAADANBgkqhkiG9w0BAQUF'
    }],
    tools: [{
      name: 'process-voice-command',
      description: 'Processes voice commands and executes actions',
      parameters: [{ name: 'audio_data', type: 'binary', description: 'Audio data in WAV format' }]
    }],
    resources: [{ name: 'Voice Commands', description: 'List of supported voice commands', url: 'https://docs.agent-hub.io/commands' }],
    prompts: [{ name: 'listening', description: 'Listening... Please speak your command.' }],
    extras_json: {
      name: 'testing 8',
      version: '1.2.0',
      description: 'AI-powered medical triage assistant for preliminary symptom assessment',
      capabilities: ['symptom-analysis', 'medical-triage', 'healthcare-guidance'],
      
    }
  },
  {
    activetime: '2025-06-02 13:40:11',
    alias: 'mcp-tools/image-processor',
    category: 'mcpServer',
    description: 'Image processing mcpServer tool with computer vision capabilities',
    dshashcode: 'f678901234567890abcdef1234567890abcdef1234567890f0',
    extras: null,
    foradapter: false,
    forapp: false,
    fordataset: false,
    forendpoint: false,
    formodel: true,
    forpromptprovider: false,
    forruntime: true,
    id: 6339,
    interfacetype: 'gRPC',
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Mon Jun 02 2025 19:15:55 GMT+0530'),
    name: 'IMGPROC-89012',
    organization: 'leo1311',
    salt: null,
    type: 'mcpServer',
    skills: [
      { name: 'computer-vision' },
      { name: 'image-classification' },
      { name: 'object-detection' }
    ],
    version: '2.7.4',
    cid: 'bafy2bzacedg7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f',
    creator: 'mcp-tools-vision-team',
    modules: [{ name: 'Image Classification' }, { name: 'Object Detection' }, { name: 'Image Enhancement' }],
    domains: [
      { name: 'Computer Vision', description: 'Image analysis and processing' },
      { name: 'Media Processing', description: 'Multimedia content analysis' }
    ],
    locators: [
      { locator_type: 'endpoint', url: 'grpc://vision.mcp-tools.io:50052' },
      { locator_type: 'oci-image', url: 'ghcr.io/mcp-tools/image-processor:v2.7.4' }
    ],
    syncs: [{ target: 'model-registry', frequency: 'daily', last_sync: '2025-06-02T00:00:00Z' }],
    publications: [
      { channel: 'mcpServer Hub', published_date: '2025-06-01', status: 'published' },
      { channel: 'Internal Registry', published_date: '2025-06-02', status: 'published' }
    ],
    extensions: [
      { ext_key: 'gpu_acceleration', ext_value: 'true', description: 'GPU acceleration enabled' },
      { ext_key: 'model_backend', ext_value: 'pytorch', description: 'Deep learning framework' }
    ],
    selectors: [{ sel_key: 'protocol', sel_value: 'grpc' }, { sel_key: 'compute', sel_value: 'gpu' }],
    signatures: [{
      algorithm: 'SHA3_256',
      value: 'MEUCIQEj9Kk0Ll1Mm2Nn3Oo4Pp5Qq6Rr7Ss8Tt9Uu0Vv1Ww2Xx3Yy==',
      certificate: 'MIIKxzCCCa+gAwIBAgIUBwAAAAFdqVz8TS3i3U1AAAAAAAFwDANBgkqhkiG9w0BAQQF'
    }],
    tools: [{
      name: 'classify-image',
      description: 'Classifies images into predefined categories',
      parameters: [
        { name: 'image_url', type: 'string', description: 'URL of image to classify' },
        { name: 'model', type: 'string', description: 'Classification model to use' }
      ]
    }],
    resources: [{ name: 'Model Documentation', description: 'Computer vision models reference', url: 'https://docs.mcp-tools.io/vision' }],
    prompts: [{ name: 'processing', description: 'Processing image... Please wait.' }]
  },
  {
    activetime: '2025-06-03 16:25:22',
    alias: 'agent-factory/recommendation-engine',
    category: 'Agent',
    connectionDetails: null,
    description: 'Recommendation engine agent with collaborative filtering',
    dshashcode: '78901234567890abcdef1234567890abcdef1234567890abcdef1',
    extras: null,
    foradapter: false,
    forapp: true,
    fordataset: true,
    forendpoint: true,
    formodel: false,
    forpromptprovider: false,
    forruntime: false,
    id: 6340,
    interfacetype: 'pipeline-agent',
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Tue Jun 03 2025 20:35:10 GMT+0530'),
    name: 'RECAGT-90123',
    organization: 'leo1311',
    salt: null,
    type: 'AIAgent',
    skills: [
      { name: 'language' },
      { name: 'framework' },
      { name: 'recommendation-systems' },
      { name: 'personalization' }
    ],
    version: '3.4.2',
    cid: 'bafy2bzacedi2j3k4l5m6n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2d3e4f5g6h',
    creator: 'agent-factory-rec-team',
    modules: [{ name: 'Collaborative Filtering' }, { name: 'Content-Based Filtering' }],
    domains: [
      { name: 'Recommendation Systems', description: 'Personalized content recommendations' },
      { name: 'E-Commerce', description: 'Product recommendation and discovery' }
    ],
    locators: [
      { locator_type: 'endpoint', url: 'https://api.agent-factory.com/recommendations' },
      { locator_type: 'documentation', url: 'https://docs.agent-factory.com/rec-engine' }
    ],
    syncs: [{ target: 'user-behavior-analytics', frequency: 'hourly', last_sync: '2025-06-03T16:00:00Z' }],
    publications: [{ channel: 'API Marketplace', published_date: '2025-06-02', status: 'published' }],
    extensions: [
      { ext_key: 'algorithm', ext_value: 'matrix-factorization', description: 'Recommendation algorithm' },
      { ext_key: 'privacy_mode', ext_value: 'federated', description: 'Privacy-preserving recommendations' }
    ],
    selectors: [{ sel_key: 'use-case', value: 'ecommerce' }, { sel_key: 'personalization', value: 'high' }],
    signatures: [{
      algorithm: 'RSA',
      value: 'MEYCIQCL1Mm2Nn3Oo4Pp5Qq6Rr7Ss8Tt9Uu0Vv1Ww2Xx3Yy4Zz5Aa==',
      certificate: 'MIILyDCCCrCgAwIBAgIVCwAAAAGepWz9UT4j4V2AAAAAAAGwEANBgkqhkiG9w0BAQVF'
    }],
    tools: [{
      name: 'get-recommendations',
      description: 'Gets personalized recommendations for a user',
      parameters: [
        { name: 'user_id', type: 'string', description: 'User identifier' },
        { name: 'count', type: 'number', description: 'Number of recommendations' }
      ]
    }],
    resources: [{ name: 'Algorithm Guide', description: 'Recommendation algorithms explained', url: 'https://docs.agent-factory.com/algorithms' }],
    prompts: [{ name: 'personalized', description: 'Based on your preferences, here are our top recommendations for you.' }],
    extras_json: {
      name: 'testing 10',
      version: '1.2.0',
      description: 'AI-powered medical triage assistant for preliminary symptom assessment',
      capabilities: ['symptom-analysis', 'medical-triage', 'healthcare-guidance'],
      
    }
  },
  {
    activetime: '2025-06-04 09:50:33',
    alias: 'mcp-services/notification-handler',
    category: 'mcpServer',
    description: 'Notification handling mcpServer service with multi-channel delivery',
    dshashcode: '8901234567890abcdef1234567890abcdef1234567890abcdef2',
    extras: null,
    foradapter: false,
    forapp: false,
    fordataset: false,
    forendpoint: true,
    formodel: false,
    forpromptprovider: true,
    forruntime: false,
    id: 6341,
    interfacetype: 'WebSocket',
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Wed Jun 04 2025 21:45:25 GMT+0530'),
    name: 'NOTIF-01234',
    organization: 'leo1311',
    salt: null,
    type: 'mcpServer',
    skills: [
      { name: 'notification-delivery' },
      { name: 'event-streaming' },
      { name: 'real-time-messaging' }
    ],
    version: '1.9.0',
    cid: 'bafy2bzacedk5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6g7h8i9j',
    creator: 'mcp-services-notify-team',
    modules: [{ name: 'Notification Router' }, { name: 'Channel Manager' }, { name: 'Event Queue' }],
    domains: [
      { name: 'Notification Services', description: 'Multi-channel notification delivery' },
      { name: 'Event Streaming', description: 'Real-time event processing and routing' }
    ],
    locators: [
      { locator_type: 'endpoint', url: 'wss://notify.mcp-services.io/v1' },
      { locator_type: 'source-code', url: 'https://github.com/mcp-services/notification-handler' }
    ],
    syncs: [{ target: 'notification-queue', frequency: 'real-time', last_sync: '2025-06-04T09:50:00Z' }],
    publications: [
      { channel: 'mcpServer Registry', published_date: '2025-06-03', status: 'published' },
      { channel: 'Service Mesh', published_date: '2025-06-04', status: 'published' }
    ],
    extensions: [
      { ext_key: 'channels', value: 'email,sms,push,webhook', description: 'Supported notification channels' },
      { ext_key: 'rate_limit', value: '1000/min', description: 'Notification rate limit' }
    ],
    selectors: [{ sel_key: 'protocol', sel_value: 'websocket' }, { sel_key: 'delivery', sel_value: 'multi-channel' }],
    signatures: [{
      algorithm: 'ECDSA',
      value: 'MEUCIQDN2Oo3Pp4Qq5Rr6Ss7Tt8Uu9Vv0Ww1Xx2Yy3Zz4Aa5Bb6Cc==',
      certificate: 'MIIMxDCCCaygAwIBAgIWDwAAAAHfqXz0VU5k5W3AAAAAAAHwFANBgkqhkiG9w0BAQWF'
    }],
    tools: [{
      name: 'send-notification',
      description: 'Sends notifications through specified channels',
      parameters: [
        { name: 'recipient', type: 'string', description: 'Notification recipient' },
        { name: 'channel', type: 'string', description: 'Delivery channel (email, sms, push)' },
        { name: 'message', type: 'string', description: 'Notification message' }
      ]
    }],
    resources: [{ name: 'Channel Setup', description: 'Notification channel configuration guide', url: 'https://docs.mcp-services.io/channels' }],
    prompts: [{ name: 'delivery', description: 'Your notification has been queued for delivery across all configured channels.' }],
    extras_json: {
      name: 'testing 1',
      version: '1.2.0',
      description: 'AI-powered medical triage assistant for preliminary symptom assessment',
      capabilities: ['symptom-analysis', 'medical-triage', 'healthcare-guidance'],
      
    }
  },
  
  // Previous version of Medical Triage Agent (v1.1.0)
  {
    activetime: '2025-04-15 10:30:00',
    alias: 'infermedica/medical-triage-agent-v1.1',
    category: 'Agent',
    connectionDetails: null,
    description: 'Medical triage AI agent v1.1 - Previous version with basic symptom analysis',
    dshashcode: '8b250ca7d30d534e2afbcc5c15ac0e060abea8b3bb5407d724a8d0632c516d81',
    extras: null,
    foradapter: true,
    forapp: false,
    fordataset: false,
    forendpoint: false,
    formodel: false,
    forpromptprovider: false,
    forruntime: false,
    id: 6340,
    interfacetype: "pipeline-agent",
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Mon Apr 15 2025 15:30:00 GMT+0530'),
    name: 'LEOSMPL-36918',
    organization: 'leo1311',
    salt: null,
    type: 'AIAgent',
    skills: [
      { name: 'language' },
      { name: 'medical-diagnosis' }
    ],
    version: '1.1.0',
    cid: 'bafy2bzaced5abc123previousversion1point1medicalagent789xyz',
    previous_record_cid: 'bafy2bzaced1point0initialmedicalagentversionabc123xyz',
    creator: 'infermedica-ai-team',
    modules: [
      { name: 'Basic Symptom Checker' },
      { name: 'Medical Knowledge Base v1' }
    ],
    domains: [
      { name: 'Healthcare', description: 'Medical triage and preliminary diagnosis' }
    ],
    locators: [
      { locator_type: 'source-code', url: 'https://github.com/infermedica/medical-agent/tree/v1.1.0' },
      { locator_type: 'api', url: 'https://api.infermedica.com/v2/triage' }
    ],
    syncs: [
      { target: 'production-health-cluster', frequency: 'daily', last_sync: '2025-04-15T08:00:00Z' }
    ],
    publications: [
      { channel: 'GitHub Registry', published_date: '2025-04-10', status: 'deprecated' }
    ],
    extensions: [
      { ext_key: 'compliance_level', ext_value: 'HIPAA', description: 'Healthcare data compliance certification' }
    ],
    selectors: [
      { sel_key: 'environment', sel_value: 'production' },
      { sel_key: 'specialty', sel_value: 'medical' }
    ],
    signatures: [{
      algorithm: 'SHA2_256',
      value: 'MEUCIQD4XvJ2jX7mM1fK8pVnG3sQ6tP5xY7vA0kB1hC8dE9fZ==',
      certificate: 'MIICxDCCAjGgAwIBAgIJAK7wE4xQ5L2cMA0GCSqGSIb3DQEBCwUAMIGJMQswCQYDVQQF'
    }],
    tools: [{
      name: 'check-symptoms',
      description: 'Basic symptom analysis',
      parameters: [
        { name: 'symptoms', type: 'array', description: 'List of patient symptoms' },
        { name: 'age', type: 'number', description: 'Patient age in years' }
      ]
    }],
    resources: [
      { name: 'API Documentation v1.1', description: 'Medical triage API reference', url: 'https://docs.infermedica.com/v1.1' }
    ],
    prompts: [
      { name: 'greeting', description: 'Hello! Please describe your symptoms.' }
    ],
    extras_json: {
      name: 'medical-triage-agent',
      version: '1.1.0',
      description: 'AI-powered medical triage assistant - v1.1',
      capabilities: ['symptom-analysis', 'medical-triage']
    }
  },

  // Newer version of Medical Triage Agent (v1.3.0)
  {
    activetime: '2025-06-10 14:20:00',
    alias: 'infermedica/medical-triage-agent-v1.3',
    category: 'Agent',
    connectionDetails: null,
    description: 'Medical triage AI agent v1.3 - Latest version with enhanced AI capabilities and multi-language support',
    dshashcode: '0d371db8f41f756f3bfcee7e27be1f171bcgb0d5dd7619f946b0f0854e738f03',
    extras: null,
    foradapter: true,
    forapp: false,
    fordataset: false,
    forendpoint: false,
    formodel: false,
    forpromptprovider: false,
    forruntime: false,
    id: 6341,
    interfacetype: "pipeline-agent",
    lastmodifiedby: 'demouser',
    lastmodifieddate: new Date('Mon Jun 10 2025 19:20:00 GMT+0530'),
    name: 'LEOSMPL-36920',
    organization: 'leo1311',
    salt: null,
    type: 'AIAgent',
    skills: [
      { name: 'language' },
      { name: 'medical-diagnosis' },
      { name: 'symptom-analysis' },
      { name: 'multilingual' }
    ],
    version: '1.3.0',
    cid: 'bafy2bzacedlmnop345newversion1point3medicalagent890zyx',
    previous_record_cid: 'bafy2bzacedkwyjnj7gd2xqxhtamdxhxlbucfjsgk4zzvdp7p4wvqq3r5mmwlg',
    creator: 'infermedica-ai-team',
    modules: [
      { name: 'Advanced Symptom Checker Module' },
      { name: 'Medical Knowledge Base v3' },
      { name: 'Multi-language Support' }
    ],
    domains: [
      { name: 'Healthcare', description: 'Advanced medical triage and diagnosis' },
      { name: 'Natural Language Processing', description: 'Understanding patient symptoms in 12 languages' },
      { name: 'AI/ML', description: 'Machine learning-powered symptom analysis' }
    ],
    locators: [
      { locator_type: 'source-code', url: 'https://github.com/infermedica/medical-agent/tree/v1.3.0' },
      { locator_type: 'api', url: 'https://api.infermedica.com/v4/triage' },
      { locator_type: 'oci-image', url: 'ghcr.io/infermedica/medical-triage:v1.3.0' }
    ],
    syncs: [
      { target: 'production-health-cluster', frequency: 'real-time', last_sync: '2025-06-10T14:00:00Z' },
      { target: 'backup-medical-db', frequency: 'hourly', last_sync: '2025-06-10T13:00:00Z' }
    ],
    publications: [
      { channel: 'GitHub Registry', published_date: '2025-06-08', status: 'published' },
      { channel: 'Docker Hub', published_date: '2025-06-08', status: 'published' },
      { channel: 'Azure Marketplace', published_date: '2025-06-09', status: 'published' }
    ],
    extensions: [
      { ext_key: 'compliance_level', ext_value: 'HIPAA,GDPR', description: 'Healthcare and data privacy compliance' },
      { ext_key: 'deployment_region', ext_value: 'global', description: 'Multi-region deployment' },
      { ext_key: 'cost_center', ext_value: 'Healthcare-AI', description: 'Budget allocation' },
      { ext_key: 'languages_supported', ext_value: '12', description: 'Number of supported languages' }
    ],
    selectors: [
      { sel_key: 'environment', value: 'production' },
      { sel_key: 'tier', value: 'enterprise-plus' },
      { sel_key: 'specialty', value: 'medical' },
      { sel_key: 'ai_model', value: 'gpt-4' }
    ],
    signatures: [{
      algorithm: 'SHA2_256',
      value: 'MEUCIQD6XvL4kZ9nO3gM0qXoI6uT8vR7yB0xD3mE5hG6jA1==',
      certificate: 'MIICzDCCAkKgAwIBAgIJAK9wG6yT7M4fMA0GCSqGSIb3DQEBCwUAMIGLMQswCQYDVQQH'
    }],
    tools: [{
      name: 'check-symptoms-advanced',
      description: 'Advanced AI-powered symptom analysis with predictive diagnostics',
      parameters: [
        { name: 'symptoms', type: 'array', description: 'List of patient symptoms with severity' },
        { name: 'age', type: 'number', description: 'Patient age in years' },
        { name: 'sex', type: 'string', description: 'Patient biological sex' },
        { name: 'medical_history', type: 'array', description: 'Previous medical conditions' },
        { name: 'language', type: 'string', description: 'Preferred language code (ISO 639-1)' }
      ]
    }],
    resources: [
      { name: 'API Documentation v4', description: 'Latest medical triage API reference', url: 'https://docs.infermedica.com/v4' },
      { name: 'User Guide', description: 'Integration guide for healthcare providers', url: 'https://docs.infermedica.com/guide/v1.3' },
      { name: 'Clinical Studies', description: 'Validation studies and accuracy reports', url: 'https://docs.infermedica.com/studies' }
    ],
    prompts: [
      { name: 'greeting', description: 'Hello! I can help you assess your symptoms in your preferred language. Please describe what you\'re experiencing.' },
      { name: 'follow-up', description: 'Based on your symptoms, I need to ask a few more questions to provide better guidance.' },
      { name: 'multilingual', description: 'I can assist you in English, Spanish, French, German, Italian, Portuguese, Polish, Russian, Chinese, Japanese, Korean, or Arabic.' }
    ],
    extras_json: {
      name: 'medical-triage-agent',
      version: '1.3.0',
      description: 'AI-powered medical triage assistant with advanced features and multi-language support',
      capabilities: ['symptom-analysis', 'medical-triage', 'healthcare-guidance', 'multilingual', 'predictive-diagnostics'],
      compliance: {
        hipaa: true,
        gdpr: true,
        certifications: ['SOC2', 'ISO27001', 'ISO13485'],
        dataRetention: '90-days'
      }
    }
  },
];


