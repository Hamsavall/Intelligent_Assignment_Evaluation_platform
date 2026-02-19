import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EvaluationRequest {
  submission_id: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function computeTFIDF(documents: string[]): Map<number, Map<string, number>> {
  const tokenizedDocs = documents.map(tokenize);
  const docCount = documents.length;

  const df: Map<string, number> = new Map();
  tokenizedDocs.forEach((tokens) => {
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach((token) => {
      df.set(token, (df.get(token) || 0) + 1);
    });
  });

  const tfidfVectors: Map<number, Map<string, number>> = new Map();

  tokenizedDocs.forEach((tokens, docIndex) => {
    const tf: Map<string, number> = new Map();
    tokens.forEach((token) => {
      tf.set(token, (tf.get(token) || 0) + 1);
    });

    const tfidf: Map<string, number> = new Map();
    tf.forEach((count, token) => {
      const termFreq = count / tokens.length;
      const inverseDocFreq = Math.log(docCount / (df.get(token) || 1));
      tfidf.set(token, termFreq * inverseDocFreq);
    });

    tfidfVectors.set(docIndex, tfidf);
  });

  return tfidfVectors;
}

function cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  const allKeys = new Set([...vec1.keys(), ...vec2.keys()]);

  allKeys.forEach((key) => {
    const val1 = vec1.get(key) || 0;
    const val2 = vec2.get(key) || 0;
    dotProduct += val1 * val2;
    mag1 += val1 * val1;
    mag2 += val2 * val2;
  });

  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

function calculatePlagiarismRisk(currentContent: string, allSubmissions: string[]): number {
  if (allSubmissions.length === 0) return 0;

  const documents = [...allSubmissions, currentContent];
  const tfidfVectors = computeTFIDF(documents);
  const currentVector = tfidfVectors.get(documents.length - 1)!;

  let maxSimilarity = 0;
  for (let i = 0; i < allSubmissions.length; i++) {
    const similarity = cosineSimilarity(tfidfVectors.get(i)!, currentVector);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  }

  return Math.min(maxSimilarity * 100, 100);
}

function generateFeedback(content: string, maxScore: number): {
  score: number;
  feedback_summary: string;
  detailed_feedback: Record<string, unknown>;
} {
  const words = tokenize(content);
  const wordCount = words.length;
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const uniqueWords = new Set(words).size;
  const vocabularyRichness = uniqueWords / Math.max(wordCount, 1);

  let score = 50;
  const feedbackPoints: string[] = [];

  if (wordCount >= 500) {
    score += 15;
    feedbackPoints.push("Good length and depth of content");
  } else if (wordCount >= 300) {
    score += 10;
    feedbackPoints.push("Adequate length, could be more detailed");
  } else {
    score += 5;
    feedbackPoints.push("Content is too brief, needs more elaboration");
  }

  if (vocabularyRichness > 0.5) {
    score += 15;
    feedbackPoints.push("Excellent vocabulary diversity");
  } else if (vocabularyRichness > 0.3) {
    score += 10;
    feedbackPoints.push("Good vocabulary usage");
  } else {
    score += 5;
    feedbackPoints.push("Limited vocabulary, try using more varied terms");
  }

  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 25) {
    score += 10;
    feedbackPoints.push("Well-structured sentences");
  } else if (avgWordsPerSentence < 15) {
    score += 5;
    feedbackPoints.push("Sentences are too short, add more complexity");
  } else {
    score += 5;
    feedbackPoints.push("Sentences are too long, break them down for clarity");
  }

  const hasIntroduction = content.toLowerCase().includes("introduction") ||
                          content.toLowerCase().includes("overview");
  const hasConclusion = content.toLowerCase().includes("conclusion") ||
                        content.toLowerCase().includes("summary");

  if (hasIntroduction && hasConclusion) {
    score += 10;
    feedbackPoints.push("Good structure with clear introduction and conclusion");
  } else if (hasIntroduction || hasConclusion) {
    score += 5;
    feedbackPoints.push("Partial structure, missing either introduction or conclusion");
  } else {
    feedbackPoints.push("Lacks clear structure, add introduction and conclusion");
  }

  score = Math.min(score, maxScore);

  const feedback_summary = feedbackPoints.join(". ") + ".";

  return {
    score,
    feedback_summary,
    detailed_feedback: {
      word_count: wordCount,
      sentence_count: sentenceCount,
      vocabulary_richness: Math.round(vocabularyRichness * 100) / 100,
      avg_words_per_sentence: Math.round(avgWordsPerSentence * 10) / 10,
      strengths: feedbackPoints.filter((_, i) => i % 2 === 0),
      improvements: feedbackPoints.filter((_, i) => i % 2 !== 0),
    },
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { submission_id }: EvaluationRequest = await req.json();

    if (!submission_id) {
      throw new Error("Missing submission_id");
    }

    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .select("*, assignments(max_score, id)")
      .eq("id", submission_id)
      .single();

    if (submissionError || !submission) {
      throw new Error("Submission not found");
    }

    const { data: otherSubmissions } = await supabase
      .from("submissions")
      .select("content")
      .eq("assignment_id", submission.assignments.id)
      .neq("id", submission_id);

    const otherContents = (otherSubmissions || []).map((s: { content: string }) => s.content);
    const plagiarismRisk = calculatePlagiarismRisk(submission.content, otherContents);

    const { score, feedback_summary, detailed_feedback } = generateFeedback(
      submission.content,
      submission.assignments.max_score
    );

    const { data: evaluation, error: evalError } = await supabase
      .from("evaluations")
      .insert({
        submission_id,
        score,
        plagiarism_risk: Math.round(plagiarismRisk * 100) / 100,
        feedback_summary,
        detailed_feedback,
      })
      .select()
      .single();

    if (evalError) throw evalError;

    await supabase
      .from("submissions")
      .update({ status: "evaluated" })
      .eq("id", submission_id);

    return new Response(
      JSON.stringify({
        submission_id,
        plagiarism_risk: `${Math.round(plagiarismRisk)}%`,
        feedback_summary,
        score,
        detailed_feedback,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
