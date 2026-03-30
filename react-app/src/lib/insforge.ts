/**
 * InsForge SDK Client — TruthLens AI
 * Backend URL: https://e4fw3htu.us-west.insforge.app
 */
import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL ?? 'https://e4fw3htu.us-west.insforge.app',
  anonKey:
    import.meta.env.VITE_INSFORGE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTY5MDh9.51G_IjTMv5DnQEa5I9nXd2Vbe8bWbVBaPnJqpbdAO1U',
});

export const FUNCTIONS_BASE = 'https://e4fw3htu.functions.insforge.app';

// ─────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────

export interface NewsInput {
  id: string;
  content: string;
  input_type: 'text' | 'url';
  extracted_text: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  news_id: string;
  final_verdict: 'likely_true' | 'likely_false' | 'misleading' | 'unverified';
  confidence_score: number;
  explanation: string;
  bias_signals: BiasSignals;
  heatmap_data: HeatmapEntry[];
  graph_data: GraphData;
  created_at: string;
}

export interface BiasSignals {
  emotional_tone: string;
  clickbait_score: number;
  urgency_level: 'low' | 'medium' | 'high';
  fear_signals: string[];
  manipulation_tactics: string[];
  suspicious_phrases: string[];
}

export interface HeatmapEntry {
  phrase: string;
  risk_score: number;
  reason: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  type: 'news' | 'claim' | 'source';
  label: string;
  stance?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

export interface Claim {
  id: string;
  news_id: string;
  claim_text: string;
  claim_index: number;
}

export interface ClaimAnalysis {
  claim_id: string;
  verdict: 'true' | 'false' | 'misleading' | 'unverified';
  confidence_score: number;
  reasoning: string;
}

export interface EvidenceSource {
  id?: string;
  claim_id: string;
  source_url: string;
  source_title: string;
  summary: string;
  stance: 'supporting' | 'contradicting' | 'neutral';
  credibility_score: number;
}

export interface ClaimBreakdownItem {
  claim: Claim;
  analysis: ClaimAnalysis | null;
  sources: EvidenceSource[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─────────────────────────────────────────────────────────────
// API Functions (SDK integration layer)
// ─────────────────────────────────────────────────────────────

/**
 * Submit news content for analysis
 */
export async function submitNews(
  content: string,
  inputType: 'text' | 'url' = 'text'
): Promise<{ news_id: string; status: string; text: string } | { error: string }> {
  const { data, error } = await insforge.functions.invoke('submitNews', {
    body: { content, input_type: inputType },
  });
  if (error) return { error: error.message };
  return data as { news_id: string; status: string; text: string };
}

/**
 * Trigger the background multi-agent pipeline
 */
export async function triggerPipeline(newsId: string, text: string): Promise<void> {
  // Fire and forget (don't wait for response, the backend will process it)
  insforge.functions.invoke('runAgentWorkflow', {
    body: { news_id: newsId, text },
  }).catch(console.error);
}

/**
 * Poll for analysis result. Returns null if still processing.
 */
export async function getAnalysisResult(newsId: string): Promise<{
  status: string;
  news?: NewsInput;
  analysis?: AnalysisResult;
} | null> {
  const { data, error } = await insforge.functions.invoke('getAnalysisResult', {
    body: { news_id: newsId },
  });
  if (error) throw new Error(error.message);
  return data as {
    status: string;
    news?: NewsInput;
    analysis?: AnalysisResult;
  };
}

/**
 * Polling helper — auto-retries every 3 seconds until analysis is done
 */
export async function pollAnalysisResult(
  newsId: string,
  onProgress?: (status: string) => void,
  maxRetries = 40
): Promise<{ news: NewsInput; analysis: AnalysisResult } | null> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await getAnalysisResult(newsId);
    if (!result) return null;

    if (result.status === 'completed' && result.analysis) {
      return { news: result.news!, analysis: result.analysis };
    }

    onProgress?.(result.status);
    await new Promise((r) => setTimeout(r, 3000));
  }
  return null;
}

/**
 * Get claim-level breakdown with evidence
 */
export async function getClaimBreakdown(newsId: string): Promise<{
  claims: ClaimBreakdownItem[];
}> {
  const { data, error } = await insforge.functions.invoke('getClaimBreakdown', {
    body: { news_id: newsId },
  });
  if (error) throw new Error(error.message);
  return data as { claims: ClaimBreakdownItem[] };
}

/**
 * Send a message to the AI chatbot assistant
 */
export async function chatbotQuery(
  newsId: string,
  question: string,
  conversationHistory: ChatMessage[] = []
): Promise<{ answer: string; role: 'assistant' }> {
  const { data, error } = await insforge.functions.invoke('chatbotQuery', {
    body: {
      news_id: newsId,
      question,
      conversation_history: conversationHistory,
    },
  });
  if (error) throw new Error(error.message);
  return data as { answer: string; role: 'assistant' };
}

/**
 * Save a report to user's history (requires auth)
 */
export async function saveReport(newsId: string): Promise<{ success: boolean }> {
  const { data, error } = await insforge.functions.invoke('userReports', {
    body: { news_id: newsId },
    method: 'POST',
  });
  if (error) throw new Error(error.message);
  return data as { success: boolean };
}

/**
 * Get user's report history (requires auth)
 */
export async function getUserHistory(): Promise<{
  history: Array<{
    report_id: string;
    news_id: string;
    saved_at: string;
    analysis: Pick<AnalysisResult, 'final_verdict' | 'confidence_score'> | null;
  }>;
}> {
  const { data, error } = await insforge.functions.invoke('userReports', {
    method: 'GET',
  });
  if (error) throw new Error(error.message);
  return data as {
    history: Array<{
      report_id: string;
      news_id: string;
      saved_at: string;
      analysis: Pick<AnalysisResult, 'final_verdict' | 'confidence_score'> | null;
    }>;
  };
}

// ─────────────────────────────────────────────────────────────
// Direct DB Queries (for lightweight reads)
// ─────────────────────────────────────────────────────────────

/**
 * Direct DB: Get evidence sources for a specific claim
 */
export async function getEvidenceForClaim(claimId: string): Promise<EvidenceSource[]> {
  const { data, error } = await insforge.database
    .from('evidence_sources')
    .select('*')
    .eq('claim_id', claimId)
    .order('credibility_score', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as EvidenceSource[];
}

/**
 * Direct DB: Get source credibility for a domain
 */
export async function getSourceCredibility(domain: string) {
  const { data } = await insforge.database
    .from('source_credibility')
    .select('domain, trust_score, history_score, category')
    .eq('domain', domain)
    .maybeSingle();
  return data;
}

// ─────────────────────────────────────────────────────────────
// Realtime Subscriptions
// ─────────────────────────────────────────────────────────────

/**
 * Subscribe to analysis completion for a news article
 * Calls onComplete when the analysis_results record is inserted
 */
export function subscribeToAnalysis(
  newsId: string,
  onComplete: (result: AnalysisResult) => void
) {
  return insforge.realtime.subscribe(
    {
      event: 'INSERT',
      table: 'analysis_results',
      filter: `news_id=eq.${newsId}`,
    },
    (payload) => {
      onComplete(payload.new as AnalysisResult);
    }
  );
}

/**
 * Subscribe to claim updates as they are extracted
 */
export function subscribeToClaims(
  newsId: string,
  onNewClaim: (claim: Claim) => void
) {
  return insforge.realtime.subscribe(
    {
      event: 'INSERT',
      table: 'claims',
      filter: `news_id=eq.${newsId}`,
    },
    (payload) => {
      onNewClaim(payload.new as Claim);
    }
  );
}

/**
 * Verdict color utility for UI
 */
export function getVerdictColor(verdict: AnalysisResult['final_verdict']): string {
  const map: Record<string, string> = {
    likely_true: '#00ff88',
    likely_false: '#ff4444',
    misleading: '#ffaa00',
    unverified: '#888888',
  };
  return map[verdict] ?? '#888888';
}

/**
 * Verdict label utility for UI
 */
export function getVerdictLabel(verdict: AnalysisResult['final_verdict']): string {
  const map: Record<string, string> = {
    likely_true: '✅ Likely True',
    likely_false: '❌ Likely False',
    misleading: '⚠️ Misleading',
    unverified: '🔍 Unverified',
  };
  return map[verdict] ?? '🔍 Unknown';
}
