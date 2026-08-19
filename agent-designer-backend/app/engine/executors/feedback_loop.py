"""Feedback-loop-agent executor.

Internal loop pattern (V1 DAG-compatible — no LangGraph cycle required):
  For each iteration up to max_iterations:
    1. Call generator LLM  → generated text
    2. Call evaluator LLM  → {"score": float, "feedback": str}
    3. If score >= score_threshold → break (threshold_met)
    4. Else prepend feedback to next generation prompt and repeat

Output keys:
  output           : str   – best generated text (highest score seen)
  score            : float – best score (0.0 if evaluator always failed)
  feedback         : str   – last evaluator feedback string
  iterations       : int   – number of completed iterations
  iterations_detail: list  – per-iteration records
  stopped_reason   : str   – "threshold_met" | "max_iterations_reached" |
                             "evaluator_failed"
"""

from __future__ import annotations

import json
from typing import Any

from app.engine.executors.base import BaseExecutor
from app.engine.connectors import get_connector

_DEFAULT_GENERATION_PROMPT = (
    "You are a helpful assistant. "
    "Generate high-quality, clear, and accurate output for the given input."
)

_EVALUATOR_SYSTEM_PROMPT = (
    "You are a strict quality evaluator. "
    "Evaluate the provided output against the given criteria. "
    "You MUST reply with ONLY valid JSON, no other text: "
    '{"score": <integer or decimal 1-10>, "feedback": "<concise actionable feedback>"}'
)

_MAX_CONSECUTIVE_EVAL_FAILURES = 3


def _resolve_input(inputs: dict[str, Any]) -> str:
    for key in ("input", "text", "message", "prompt", "value"):
        candidate = inputs.get(key)
        if candidate is not None:
            return str(candidate)
    for v in inputs.values():
        if v is not None:
            return str(v)
    return ""


def _find_json_object(text: str) -> dict | None:
    """Walk the string to find and parse the first balanced {...} JSON object."""
    start = 0
    while True:
        start = text.find("{", start)
        if start == -1:
            return None
        depth = 0
        in_str = False
        escape = False
        for i in range(start, len(text)):
            ch = text[i]
            if in_str:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    try:
                        obj = json.loads(text[start : i + 1])
                        if isinstance(obj, dict):
                            return obj
                    except json.JSONDecodeError:
                        pass
                    break
        start += 1


def _parse_eval_response(text: str) -> tuple[float, str]:
    obj = _find_json_object(text.strip())
    if obj:
        raw_score = obj.get("score", 0)
        feedback = str(obj.get("feedback", "No feedback provided."))
        try:
            score = float(raw_score)
            return max(0.0, min(10.0, score)), feedback
        except (TypeError, ValueError):
            pass
    return 0.0, f"Evaluator response not parseable as JSON. Raw: {text[:200]}"


async def _emit_log(
    log_fn: Any,
    db: Any,
    execution_id: str,
    node_id: str,
    level: str,
    message: str,
    detail: dict | None = None,
) -> None:
    if log_fn is None or db is None or not execution_id:
        return
    try:
        await log_fn(db, execution_id, node_id, level, message, detail or {})
    except Exception:
        pass


class FeedbackLoopAgentExecutor(BaseExecutor):
    """
    Self-contained generate → evaluate → refine loop.
    Compatible with V1 DAG graphs (internal loop, no graph cycle required).
    """

    async def execute(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        config: dict = (node.get("data") or {}).get("config") or {}
        node_id: str = node.get("id", "feedback_loop_agent")

        # Generator config
        provider: str = (config.get("provider") or "azure_openai").strip()
        model: str = (config.get("model") or "gpt-4o").strip()
        generation_prompt: str = (
            config.get("generation_prompt") or _DEFAULT_GENERATION_PROMPT
        ).strip()
        temperature: float = float(config.get("temperature", 0.7))
        max_tokens: int = int(config.get("max_tokens") or 2048)

        # Evaluator config
        eval_provider: str = (config.get("evaluator_provider") or provider).strip()
        eval_model: str = (config.get("evaluator_model") or model).strip()
        eval_criteria: str = (config.get("evaluation_criteria") or "").strip()
        if not eval_criteria:
            raise ValueError(
                "Feedback Loop Agent requires 'evaluation_criteria'. "
                "Set it in the node inspector."
            )

        # Loop control
        score_threshold: float = float(config.get("score_threshold", 7.0))
        max_iterations: int = max(1, int(config.get("max_iterations") or 3))

        # Logging (optional — present only if runner adds log_fn to ctx)
        log_fn = context.get("log_fn")
        execution_id = context.get("execution_id", "")
        db = context.get("db")

        original_input: str = _resolve_input(inputs)

        gen_connector = get_connector(provider)
        eval_connector = get_connector(eval_provider)

        current_prompt = original_input
        best_output: str = ""
        best_score: float = -1.0
        last_feedback: str = ""
        last_score: float = 0.0
        iterations_detail: list[dict] = []
        stopped_reason: str = "max_iterations_reached"
        consecutive_eval_failures: int = 0

        for i in range(1, max_iterations + 1):
            iter_label = f"[Iteration {i}/{max_iterations}]"

            await _emit_log(
                log_fn, db, execution_id, node_id, "info",
                f"{iter_label} Generating response...",
                {"iteration": i, "max_iterations": max_iterations},
            )

            # Step 1: Generate
            gen_messages = [
                {"role": "system", "content": generation_prompt},
                {"role": "user", "content": current_prompt},
            ]
            generated: str = await gen_connector.chat(
                model=model,
                messages=gen_messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )

            await _emit_log(
                log_fn, db, execution_id, node_id, "info",
                f"{iter_label} Generation complete ({len(generated)} chars). Evaluating...",
                {"iteration": i, "generated_length": len(generated)},
            )

            # Step 2: Evaluate
            eval_user_content = (
                f"Original Input:\n{original_input}\n\n"
                f"Generated Output:\n{generated}\n\n"
                f"Evaluation Criteria:\n{eval_criteria}"
            )
            eval_messages = [
                {"role": "system", "content": _EVALUATOR_SYSTEM_PROMPT},
                {"role": "user", "content": eval_user_content},
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
                consecutive_eval_failures = 0
            except Exception as exc:
                consecutive_eval_failures += 1
                feedback = f"Evaluator call failed: {exc}"
                score = 0.0

                await _emit_log(
                    log_fn, db, execution_id, node_id, "warning",
                    f"{iter_label} Evaluator error (consecutive #{consecutive_eval_failures}): {exc}",
                    {"iteration": i, "consecutive_failures": consecutive_eval_failures},
                )

                if consecutive_eval_failures >= _MAX_CONSECUTIVE_EVAL_FAILURES:
                    if not best_output:
                        best_output = generated
                    stopped_reason = "evaluator_failed"
                    iterations_detail.append({
                        "iteration": i,
                        "generated": generated,
                        "score": 0.0,
                        "feedback": feedback,
                    })
                    break

            last_score = score
            last_feedback = feedback

            if score > best_score:
                best_score = score
                best_output = generated

            iterations_detail.append({
                "iteration": i,
                "generated": generated,
                "score": score,
                "feedback": feedback,
            })

            # Step 3: Decide whether to continue
            if score >= score_threshold:
                stopped_reason = "threshold_met"
                await _emit_log(
                    log_fn, db, execution_id, node_id, "success",
                    f"{iter_label} Score {score:.1f}/10 >= threshold {score_threshold}. Accepting output.",
                    {"iteration": i, "score": score, "threshold": score_threshold},
                )
                break
            else:
                await _emit_log(
                    log_fn, db, execution_id, node_id, "info",
                    f"{iter_label} Score {score:.1f}/10 < threshold {score_threshold}. "
                    f"Refining... Feedback: {feedback[:120]}",
                    {"iteration": i, "score": score, "threshold": score_threshold},
                )

                # Step 4: Build refined prompt for next iteration
                current_prompt = (
                    f"Original request:\n{original_input}\n\n"
                    f"Previous attempt scored {score:.1f}/10:\n{generated}\n\n"
                    f"Evaluator feedback:\n{feedback}\n\n"
                    "Please improve your response based on the feedback above."
                )

        if not best_output and iterations_detail:
            best_output = iterations_detail[-1]["generated"]

        if stopped_reason == "max_iterations_reached":
            await _emit_log(
                log_fn, db, execution_id, node_id, "warning",
                f"Max iterations ({max_iterations}) reached without meeting "
                f"threshold {score_threshold}. Best score: {best_score:.1f}/10.",
                {"max_iterations": max_iterations, "best_score": best_score},
            )

        final_score = best_score if best_score >= 0.0 else 0.0

        await _emit_log(
            log_fn, db, execution_id, node_id, "success",
            f"Feedback loop complete. Score: {final_score:.1f}/10 after "
            f"{len(iterations_detail)} iteration(s). Reason: {stopped_reason}.",
            {
                "final_score": final_score,
                "iterations": len(iterations_detail),
                "stopped_reason": stopped_reason,
            },
        )

        return {
            "output": best_output,
            "score": round(final_score, 2),
            "feedback": last_feedback,
            "iterations": len(iterations_detail),
            "iterations_detail": iterations_detail,
            "stopped_reason": stopped_reason,
        }
