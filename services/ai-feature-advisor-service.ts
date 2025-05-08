"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import type { FeatureReport } from "@/types/report-types"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

// Use Groq API key
const groqApiKey =
  "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"

export async function getFeatureAdvice(
  messages: ChatMessage[],
  features: FeatureReport[],
): Promise<{ response: string }> {
  try {
    // Create a context with the feature data
    const featuresContext = features
      .map(
        (f) => `
Feature: ${f.name}
Description: ${f.description || "N/A"}
RICE Score: ${f.riceScore}
Effort: ${f.effort}/10
Impact: ${f.impact}/10
Risk: ${f.risk}
Complexity: ${f.complexity}/10
Business Value: ${f.businessValue}/10
Timeline: ${f.timeline} days
User Stories: ${f.userStories?.join("; ") || "N/A"}
Dependencies: ${f.dependencies?.join(", ") || "N/A"}
`,
      )
      .join("\n\n")

    // Create a system prompt that includes the feature data
    const systemPrompt = `
You are FeatureGPT, an AI advisor for product managers and developers analyzing features for their application.
You have access to the following feature analysis data:

${featuresContext}

Based on this data, answer questions about these features, provide recommendations, and help with "what-if" scenarios.
When discussing features, reference their metrics (RICE score, effort, impact, etc.) to support your answers.
If asked about modifying a feature or creating a new one, estimate how it would affect the metrics.
Keep your responses concise, practical, and focused on helping the user make informed decisions about feature prioritization and implementation.
`

    // Format the conversation history for the AI
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Generate a response using the Groq API
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      apiKey: groqApiKey,
      system: systemPrompt,
      messages: formattedMessages,
    })

    return { response: text }
  } catch (error) {
    console.error("Error getting feature advice:", error)
    return {
      response:
        "I'm sorry, I encountered an error while analyzing the features. Please try again or check if the feature data is correctly formatted.",
    }
  }
}
