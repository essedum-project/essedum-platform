// Wizard dropdown enums and metadata — mirrored from integration-hub.

export interface DataPipelineTypeOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  isSlm?: boolean;
}

export interface TrainingJobTypeOption {
  value: string;
  label: string;
  icon: string;
  description: string;
  defaultFramework: string;
  defaultBaseModel: string;
}

export const DATA_PIPELINE_TYPES: DataPipelineTypeOption[] = [
  { value: 'feature-engineering', label: 'Feature Engineering',     icon: 'bolt',              description: 'Classical ML feature preparation' },
  { value: 'data-cleaning',       label: 'Data Cleaning',           icon: 'cleaning_services', description: 'Cleaning, dedup, outlier handling' },
  { value: 'etl',                 label: 'ETL / Ingestion',         icon: 'sync_alt',          description: 'DB to DB / DB to DataLake' },
  { value: 'rag-ingestion',       label: 'RAG Ingestion',           icon: 'menu_book',         description: 'Chunk → embed → vector store (Qdrant)' },
  { value: 'slm-sft',             label: 'SLM — Instruction / SFT', icon: 'psychology',        description: 'ChatML / Alpaca dataset prep',  isSlm: true },
  { value: 'slm-cot',             label: 'SLM — Reasoning / CoT',   icon: 'tips_and_updates',  description: 'Distil teacher chain-of-thought', isSlm: true },
  { value: 'slm-dpo',             label: 'SLM — DPO Preference',    icon: 'balance',           description: 'Preference-pair dataset prep',  isSlm: true },
  { value: 'slm-pretrain',        label: 'SLM — Pre-training Corpus', icon: 'inventory_2',     description: 'Token-level corpus prep',       isSlm: true },
];

export const EXECUTORS = [
  { value: 'py-job-executor',           label: 'py-job-executor',           description: 'Standard Python job executor' },
  { value: 'py-job-azure-executer',     label: 'py-job-azure-executer',     description: 'Azure ML job executor' },
  { value: 'py-job-sagemaker-executer', label: 'py-job-sagemaker-executer', description: 'AWS SageMaker job executor' },
  { value: 'py-job-vertex-executer',    label: 'py-job-vertex-executer',    description: 'GCP Vertex AI job executor' },
  { value: 'container-executor',        label: 'Container Executor',        description: 'Build and deploy as a Docker container on Kubernetes' },
];

export interface ContainerConfig {
  containerImage?: string;
  containerRegistry?: string;
  containerEnvVars?: { name: string; value: string }[];
  useGpu?: boolean;
}

export const FALLBACK_SLM_BASE_MODELS = [
  'meta-llama/Llama-3.2-1B', 'meta-llama/Llama-3.2-3B',
  'Qwen/Qwen2.5-0.5B', 'Qwen/Qwen2.5-1.5B', 'Qwen/Qwen2.5-3B', 'Qwen/Qwen2.5-7B',
  'HuggingFaceTB/SmolLM2-1.7B', 'microsoft/phi-3-mini',
  'google/gemma-2-2b', 'mistralai/Mistral-7B-v0.3',
];

export const TEACHER_MODELS = [
  'gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'claude-opus-4', 'llama-3.1-70b-instruct',
];

export const OUTPUT_FORMATS_BY_TYPE: Record<string, string[]> = {
  'slm-sft':       ['chatml', 'alpaca', 'llama3', 'sharegpt', 'raw-text'],
  'slm-cot':       ['grpo-prompt-solution', 'chatml-cot', 'raw-cot'],
  'slm-dpo':       ['preference-pairs-jsonl', 'dpo-chatml'],
  'slm-pretrain':  ['arrow-tokenized', 'raw-text-jsonl'],
  'rag-ingestion': ['qdrant-collection', 'milvus-collection', 'pgvector'],
};

export const PROBLEM_TYPES = ['classification', 'regression', 'clustering', 'nlp', 'timeseries'];

export const SCHEDULE_PRESETS = [
  { label: 'Manual',         value: '' },
  { label: 'Every hour',     value: '0 * * * *' },
  { label: 'Every 2 hours',  value: '0 */2 * * *' },
  { label: 'Daily 02:00',    value: '0 2 * * *' },
  { label: 'Weekly Mon 03:00', value: '0 3 * * 1' },
];

export const TRAINING_JOB_TYPES: TrainingJobTypeOption[] = [
  { value: 'traditional',   label: 'Traditional ML',   icon: 'science',      description: 'XGBoost / LightGBM / Scikit-learn',
    defaultFramework: 'XGBoost 1.7', defaultBaseModel: 'xgboost.XGBClassifier' },
  { value: 'slm-finetune',  label: 'SLM Fine-tuning',  icon: 'psychology',   description: 'LoRA / QLoRA / Full Fine-tune',
    defaultFramework: 'Hugging Face + PEFT', defaultBaseModel: 'meta-llama/Llama-3.2-1B' },
  { value: 'reasoning',     label: 'Reasoning Model',  icon: 'tips_and_updates', description: 'GRPO / DPO / ORPO',
    defaultFramework: 'TRL + Transformers', defaultBaseModel: 'Qwen/Qwen2.5-7B' },
  { value: 'distillation',  label: 'Model Distillation', icon: 'call_merge', description: 'KD / SFT-distill / MiniLLM',
    defaultFramework: 'PyTorch + Transformers', defaultBaseModel: 'microsoft/phi-3-mini' },
];

export const FRAMEWORKS_BY_JOB_TYPE: Record<string, string[]> = {
  'traditional':  ['XGBoost 1.7', 'LightGBM 4.1', 'Scikit-learn 1.3', 'PyTorch 2.1', 'TensorFlow 2.14'],
  'slm-finetune': ['Hugging Face + PEFT', 'LLaMA-Factory', 'Swift', 'Axolotl', 'Unsloth'],
  'reasoning':    ['TRL + Transformers', 'OpenRLHF', 'verl', 'LLaMA-Factory'],
  'distillation': ['PyTorch + Transformers', 'LLaMA-Factory', 'MiniLLM', 'DistillKit'],
};

export const METHODS_BY_JOB_TYPE: Record<string, string[]> = {
  'slm-finetune': ['LoRA', 'QLoRA', 'Full Fine-tune', 'DoRA', 'LoRA+'],
  'reasoning':    ['GRPO', 'DPO', 'PPO', 'RLHF', 'ORPO', 'SimPO'],
  'distillation': ['SFT-distill', 'KD-logits', 'MiniLLM', 'DistiLLM', 'Seq-KD'],
};

export const QUANTIZATION_OPTIONS = ['4-bit', '8-bit', 'fp16', 'bf16', 'fp32'];
