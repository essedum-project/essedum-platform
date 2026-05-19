// Grouped code-snippet metadata reused by both the data-pipeline and training
// editors. Click-to-insert into the ace editor.

export interface Snippet { name: string; desc: string; snippet: string; }
export interface SnippetCategory {
  label: string;
  icon: string;        // material icon name
  color: string;       // any CSS color
  fns: Snippet[];
}

export const DATA_PIPELINE_SNIPPETS: SnippetCategory[] = [
  {
    label: 'Data Loading', icon: 'storage', color: '#06b6d4',
    fns: [
      { name: 'load_from_connection', desc: 'Query a table from a registered connection',
        snippet: `df = dc.query("""\n    SELECT *\n    FROM your_table\n    WHERE condition = TRUE\n""")` },
      { name: 'load_csv', desc: 'Load a CSV from a container',
        snippet: `df = dc.read_file("path/to/file.csv", format="csv")` },
      { name: 'load_parquet', desc: 'Load a Parquet file',
        snippet: `df = dc.read_file("path/to/data.parquet", format="parquet")` },
    ],
  },
  {
    label: 'Cleaning', icon: 'cleaning_services', color: '#10b981',
    fns: [
      { name: 'drop_nulls', desc: 'Drop rows with missing values',
        snippet: `df = df.dropna(subset=["col1", "col2"])` },
      { name: 'remove_duplicates', desc: 'Drop duplicate rows',
        snippet: `before = len(df)\ndf = df.drop_duplicates().reset_index(drop=True)\nprint(f"Removed {before - len(df):,} duplicates")` },
      { name: 'clip_outliers', desc: 'Clip to 1st–99th percentile',
        snippet: `for col in numeric_cols:\n    lo, hi = df[col].quantile(0.01), df[col].quantile(0.99)\n    df[col] = df[col].clip(lo, hi)` },
    ],
  },
  {
    label: 'Feature Engineering', icon: 'bolt', color: '#8b5cf6',
    fns: [
      { name: 'date_features', desc: 'Extract date parts',
        snippet: `df["year"]    = df["date_col"].dt.year\ndf["month"]   = df["date_col"].dt.month\ndf["weekday"] = df["date_col"].dt.weekday` },
      { name: 'lag_features', desc: 'Lag features for time series',
        snippet: `for lag in [1, 3, 7, 14]:\n    df[f"lag_{lag}"] = df["value_col"].shift(lag)\ndf = df.dropna()` },
      { name: 'rolling_stats', desc: 'Rolling mean & std',
        snippet: `df["rolling_mean_7"] = df["value_col"].rolling(7).mean()\ndf["rolling_std_7"]  = df["value_col"].rolling(7).std()` },
    ],
  },
  {
    label: 'Encoding & Scaling', icon: 'shuffle', color: '#f59e0b',
    fns: [
      { name: 'label_encode', desc: 'Label-encode a categorical column',
        snippet: `from sklearn.preprocessing import LabelEncoder\ndf["col_encoded"] = LabelEncoder().fit_transform(df["cat_col"].astype(str))` },
      { name: 'one_hot_encode', desc: 'One-hot encode columns',
        snippet: `df = pd.get_dummies(df, columns=["cat_col1", "cat_col2"], drop_first=True)` },
      { name: 'standard_scale', desc: 'StandardScaler',
        snippet: `from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\ndf[numeric_cols] = scaler.fit_transform(df[numeric_cols])` },
    ],
  },
  {
    label: 'Output & Save', icon: 'save', color: '#6366f1',
    fns: [
      { name: 'save_to_container', desc: 'Write DataFrame to output container',
        snippet: `output_dc.write_table(df, "prepared.output_table", mode="overwrite")\nprint(f"Saved {len(df):,} rows")` },
      { name: 'log_metrics', desc: 'Log pipeline run metrics',
        snippet: `executor.log_metrics({"rows_output": len(df), "n_features": df.shape[1]})` },
    ],
  },
];

export const TRAINING_SNIPPETS: SnippetCategory[] = [
  {
    label: 'Traditional ML', icon: 'science', color: '#06b6d4',
    fns: [
      { name: 'xgboost_classifier', desc: 'XGBoost classifier with eval set',
        snippet: `model = XGBClassifier(\n    n_estimators=200, learning_rate=0.05, max_depth=6,\n    eval_metric="logloss", early_stopping_rounds=20, random_state=42\n)\nmodel.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=50)` },
      { name: 'optuna_hpo', desc: 'Hyperparameter search with Optuna',
        snippet: `import optuna\n\ndef objective(trial):\n    lr  = trial.suggest_float("lr", 1e-4, 0.3, log=True)\n    dep = trial.suggest_int("depth", 3, 10)\n    model = XGBClassifier(learning_rate=lr, max_depth=dep)\n    model.fit(X_train, y_train)\n    return accuracy_score(y_val, model.predict(X_val))\n\nstudy = optuna.create_study(direction="maximize")\nstudy.optimize(objective, n_trials=50)` },
    ],
  },
  {
    label: 'LoRA / QLoRA', icon: 'psychology', color: '#8b5cf6',
    fns: [
      { name: 'lora_config', desc: 'PEFT LoRA config',
        snippet: `from peft import LoraConfig, get_peft_model, TaskType\nlora_config = LoraConfig(\n    task_type=TaskType.CAUSAL_LM,\n    r=16, lora_alpha=32, lora_dropout=0.05,\n    target_modules=["q_proj","v_proj","k_proj","o_proj"], bias="none",\n)\nmodel = get_peft_model(model, lora_config)` },
      { name: 'qlora_4bit_load', desc: 'Load model in 4-bit',
        snippet: `from transformers import BitsAndBytesConfig\nimport torch\nbnb_config = BitsAndBytesConfig(\n    load_in_4bit=True, bnb_4bit_quant_type="nf4",\n    bnb_4bit_compute_dtype=torch.bfloat16,\n)\nmodel = AutoModelForCausalLM.from_pretrained(MODEL_ID, quantization_config=bnb_config, device_map="auto")` },
    ],
  },
  {
    label: 'Reasoning (GRPO / DPO)', icon: 'tips_and_updates', color: '#f59e0b',
    fns: [
      { name: 'grpo_reward_funcs', desc: 'GRPO reward functions',
        snippet: `import re\n\ndef accuracy_reward(completions, solution, **kw):\n    rewards = []\n    for c in completions:\n        ans = re.search(r"<answer>(.*?)</answer>", c, re.DOTALL)\n        rewards.append(1.0 if ans and ans.group(1).strip() == solution.strip() else 0.0)\n    return rewards` },
    ],
  },
  {
    label: 'Evaluation', icon: 'analytics', color: '#0ea5e9',
    fns: [
      { name: 'lm_eval_harness', desc: 'Run lm-eval-harness benchmarks',
        snippet: `from lm_eval import evaluator\nresults = evaluator.simple_evaluate(\n    model="hf", model_args=f"pretrained={MODEL_PATH},dtype=bfloat16",\n    tasks=["arc_easy","hellaswag","mmlu","gsm8k"], num_fewshot=0,\n)` },
    ],
  },
];
