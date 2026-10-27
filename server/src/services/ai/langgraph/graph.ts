import { StateGraph, START, END } from "@langchain/langgraph"
import { CopilotAnnotation, type CopilotGraphState } from "./types.js"
import {
  validateInputNode,
  prepareSecurityContextNode,
  classifyIntentNode,
  aiProcessingNode,
  validateResponseNode,
  handleErrorNode,
} from "./nodes.js"

/**
 * Conditional router after input validation.
 */
function routeAfterValidation(state: CopilotGraphState): "handle_error" | "prepare_security_context" {
  if (!state.isValid || state.error) {
    return "handle_error"
  }
  return "prepare_security_context"
}

/**
 * Conditional router after response validation.
 */
function routeAfterResponseValidation(state: CopilotGraphState): "handle_error" | typeof END {
  if (!state.isValid || state.error) {
    return "handle_error"
  }
  return END
}

/**
 * Creates an uncompiled StateGraph instance for the CollabNet Copilot workflow.
 */
export function createCopilotGraph() {
  const workflow = new StateGraph(CopilotAnnotation)
    .addNode("validate_input", validateInputNode)
    .addNode("prepare_security_context", prepareSecurityContextNode)
    .addNode("classify_intent", classifyIntentNode)
    .addNode("ai_processing", aiProcessingNode)
    .addNode("validate_response", validateResponseNode)
    .addNode("handle_error", handleErrorNode)

    // Flow edges
    .addEdge(START, "validate_input")
    .addConditionalEdges("validate_input", routeAfterValidation, {
      handle_error: "handle_error",
      prepare_security_context: "prepare_security_context",
    })
    .addEdge("prepare_security_context", "classify_intent")
    .addEdge("classify_intent", "ai_processing")
    .addEdge("ai_processing", "validate_response")
    .addConditionalEdges("validate_response", routeAfterResponseValidation, {
      handle_error: "handle_error",
      [END]: END,
    })
    .addEdge("handle_error", END)

  return workflow
}

/**
 * Pre-compiled default Copilot graph.
 */
export const compiledCopilotGraph = createCopilotGraph().compile()
