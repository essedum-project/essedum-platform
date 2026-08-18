"""Feedback Evaluator executor — branching node for decomposed feedback loops.

This node is the evaluator half of a decomposed feedback loop. It:
  1. Receives a generated text on the `input` handle
  2. Calls an evaluator LLM to score it against configurable criteria
  3. Routes to `pass`  when score >= threshold OR max_iterations reached
  4. Routes to `retry` with a reformatted improvement prompt otherwise

The back-edge from `retry` → upstream generator creates a cycle in the
LangGraph graph, which is handled natively. Iteration tracking uses
`context["loop_count"]` injected by the compiler's node_fn.

Output keys:
  _route    : "pass" | "retry"
  output    : str  — accepted text (pass) or improvement prompt (retry)
  score     : float
  feedback  : str
  iteration : int
"""

from __future__ import annotations

from typing import Any

from app.engine.executors.base import BaseExecutor
from app.engine.connectors import get_connector
# Reuse parsing helpers from the existing feedback_loop executor
from app.engine.executors.feedback_loop import (
    _parse_eval_response,
    _emit_log,
    _EVALUATOR_SYSTEM_PROMPT,
)

_RETRY_PROMPT_TEMPLATE = (
    "Original request:\n{original_input}\n\n"
    "Previous attempt (score {score:.1f}/10):\n{generated}\n\n"
    "Evaluator feedback:\n{feedback}\n\n"
    "Please improve your response based on the feedback above."
)


class FeedbackEvaluatorExecutor(BaseExecutor):
    """
    Branching evaluator node for decomposed feedback loops.

    Canvas wiring:
        LLM Node ──[output]──► Feedback Evaluator ──[pass]──► Text Output
             ▲                         │
             └──────────[retry]────────┘
    """

    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        config: dict = (node.get("data") or {}).get("config") or {}
        node_id: str = node.get("id", "feedback_evaluator")

        # Evaluator config
        eval_provider: str = (config.get("evaluator_provider") or "azure_openai").strip()
        eval_model: str = (config.get("evaluator_model") or "gpt-4o").strip()
        eval_criteria: str = (config.get("evaluation_criteria") or "").strip()
        if not eval_criteria:
            raise ValueError(
                "Feedback Evaluator requires 'evaluation_criteria'. "
                "Set it in the node inspector."
            )
        score_threshold: float = float(config.get("score_threshold", 7.0))
        max_iterations: int = max(1, int(config.get("max_iterations") or 3))

        # Logging
        log_fn = context.get("log_fn")
        execution_id = context.get("execution_id", "")
        db = context.get("db")

        # Iteration count injected by compiler's node_fn
        iteration: int = int(context.get("loop_count", 0))

        # Resolve inputs.
        # original_input comes from context (the original user message) so that
        # connecting TextInput directly to the evaluator — which would cause
        # parallel execution with the generator — is not needed.
        generated_text: str = str(inputs.get("input") or "")
        _ctx_input = context.get("input") or {}
        original_input: str = str(
            _ctx_input.get("message") or _ctx_input.get("text") or generated_text
        )

        iter_label = f"[Iteration {iteration + 1}]"

        # Hard exit when max_iterations reached — route to pass without evaluating
        if iteration >= max_iterations:
            await _emit_log(
                log_fn, db, execution_id, node_id, "warning",
                f"{iter_label} Max iterations ({max_iterations}) reached. "
                f"Passing output through without further evaluation.",
                {"iteration": iteration, "max_iterations": max_iterations},
            )
            return {
                "_route":    "pass",
                "pass":      generated_text,   # matches sourceHandle "pass" on canvas
                "output":    generated_text,
                "score":     0.0,
                "feedback":  "Max iterations reached.",
                "iteration": iteration,
            }

        await _emit_log(
            log_fn, db, execution_id, node_id, "info",
            f"{iter_label} Evaluating output ({len(generated_text)} chars)...",
            {"iteration": iteration},
        )

        # Call evaluator LLM
        eval_connector = get_connector(eval_provider)
        eval_user_content = (
            f"Original Input:\n{original_input}\n\n"
            f"Generated Output:\n{generated_text}\n\n"
            f"Evaluation Criteria:\n{eval_criteria}"
        )
        eval_messages = [
            {"role": "system", "content": _EVALUATOR_SYSTEM_PROMPT},
            {"role": "user",   "content": eval_user_content},
        ]

        score: float = 0.0
        feedback: str = ""
        try:
            eval_response: str = await eval_connector.chat(
                model=eval_model,
                messages=eval_messages,
                temperature=0.2,
                max_tokens=512,
            )
            score, feedback = _parse_eval_response(eval_response)
        except Exception as exc:
            await _emit_log(
                log_fn, db, execution_id, node_id, "warning",
                f"{iter_label} Evaluator call failed: {exc}. Passing through.",
                {"iteration": iteration, "error": str(exc)},
            )
            return {
                "_route":    "pass",
                "pass":      generated_text,   # matches sourceHandle "pass" on canvas
                "output":    generated_text,
                "score":     0.0,
                "feedback":  f"Evaluator failed: {exc}",
                "iteration": iteration,
            }

        # Decide: pass or retry
        if score >= score_threshold:
            await _emit_log(
                log_fn, db, execution_id, node_id, "success",
                f"{iter_label} Score {score:.1f}/10 >= threshold {score_threshold}. "
                f"Routing to pass.",
                {"iteration": iteration, "score": score, "threshold": score_threshold},
            )
            return {
                "_route":    "pass",
                "pass":      generated_text,   # matches sourceHandle "pass" on canvas
                "output":    generated_text,
                "score":     round(score, 2),
                "feedback":  feedback,
                "iteration": iteration,
            }
        else:
            retry_prompt = _RETRY_PROMPT_TEMPLATE.format(
                original_input=original_input,
                score=score,
                generated=generated_text,
                feedback=feedback,
            )
            await _emit_log(
                log_fn, db, execution_id, node_id, "info",
                f"{iter_label} Score {score:.1f}/10 < threshold {score_threshold}. "
                f"Routing to retry. Feedback: {feedback[:120]}",
                {"iteration": iteration, "score": score, "threshold": score_threshold},
            )
            return {
                "_route":    "retry",
                "retry":     retry_prompt,     # matches sourceHandle "retry" on canvas
                "output":    retry_prompt,
                "score":     round(score, 2),
                "feedback":  feedback,
                "iteration": iteration,
            }
