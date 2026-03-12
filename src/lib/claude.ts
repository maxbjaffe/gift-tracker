import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const COST_PER_MILLION = {
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.25, output: 1.25 },
} as const;

const MODEL_MAP = {
  sonnet: 'claude-sonnet-4-20250514',
  haiku: 'claude-haiku-4-5-20251001',
} as const;

type ModelAlias = keyof typeof MODEL_MAP;

interface CallClaudeOptions {
  model?: ModelAlias;
  maxTokens?: number;
  system?: string;
  temperature?: number;
  caller?: string;
  images?: { base64: string; mediaType: string }[];
}

interface MetricsEntry {
  model: string;
  caller: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
  estimated_cost_usd: number;
  success: boolean;
  error_message: string | null;
}

let metricsBuffer: MetricsEntry[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushMetrics();
  }, 5000);
}

async function flushMetrics() {
  if (metricsBuffer.length === 0) return;
  const batch = metricsBuffer.splice(0);

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return;

    const supabase = createClient(url, key);
    await supabase.from('giftstash_ai_calls').insert(batch);
  } catch (err) {
    console.error('[callClaude] Failed to flush metrics:', err);
    // Put them back for next flush
    metricsBuffer.unshift(...batch);
  }
}

const RETRYABLE_STATUS = [429, 500, 502, 503, 529];
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export async function callClaude(
  prompt: string,
  options: CallClaudeOptions = {}
): Promise<string> {
  const {
    model = 'haiku',
    maxTokens = 1024,
    system,
    temperature,
    caller = 'unknown',
    images,
  } = options;

  const modelId = MODEL_MAP[model];
  const start = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const content: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

      if (images?.length) {
        for (const img of images) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: img.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
              data: img.base64,
            },
          });
        }
      }

      content.push({ type: 'text', text: prompt });

      const params: Anthropic.MessageCreateParams = {
        model: modelId,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content }],
      };

      if (system) params.system = system;
      if (temperature !== undefined) params.temperature = temperature;

      const response = await anthropic.messages.create(params);
      const latencyMs = Date.now() - start;

      const text =
        response.content[0].type === 'text' ? response.content[0].text : '';

      const costModel =
        COST_PER_MILLION[modelId as keyof typeof COST_PER_MILLION];
      const cost = costModel
        ? (response.usage.input_tokens * costModel.input +
            response.usage.output_tokens * costModel.output) /
          1_000_000
        : 0;

      metricsBuffer.push({
        model: modelId,
        caller,
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        latency_ms: latencyMs,
        estimated_cost_usd: cost,
        success: true,
        error_message: null,
      });
      scheduleFlush();

      return text;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));

      const status =
        err && typeof err === 'object' && 'status' in err
          ? (err as { status: number }).status
          : 0;

      if (RETRYABLE_STATUS.includes(status) && attempt < MAX_RETRIES - 1) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // Non-retryable or final attempt
      metricsBuffer.push({
        model: modelId,
        caller,
        input_tokens: 0,
        output_tokens: 0,
        latency_ms: Date.now() - start,
        estimated_cost_usd: 0,
        success: false,
        error_message: lastError.message,
      });
      scheduleFlush();

      throw lastError;
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('callClaude: exhausted retries');
}
