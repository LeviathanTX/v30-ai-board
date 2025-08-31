// Supabase Edge Function for Semantic Search
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Generate embedding for search query
async function generateQueryEmbedding(query: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: query,
    }),
  })

  const data = await response.json()
  return data.data[0].embedding
}

serve(async (req) => {
  try {
    const { query, userId, limit = 10, threshold = 0.7 } = await req.json()

    // Generate embedding for the search query
    const queryEmbedding = await generateQueryEmbedding(query)

    // Perform vector similarity search
    // Note: This requires a custom PostgreSQL function for vector similarity
    const { data: searchResults, error: searchError } = await supabase.rpc(
      'search_documents',
      {
        query_embedding: queryEmbedding,
        user_id: userId,
        match_count: limit,
        similarity_threshold: threshold
      }
    )

    if (searchError) throw searchError

    // Enhance results with document metadata
    const documentIds = [...new Set(searchResults.map(r => r.document_id))]
    
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, name, type, summary, created_at')
      .in('id', documentIds)
      .eq('user_id', userId)

    if (docError) throw docError

    // Combine results
    const enhancedResults = searchResults.map(result => {
      const doc = documents.find(d => d.id === result.document_id)
      return {
        ...result,
        document: doc,
        relevance_score: result.similarity
      }
    })

    // Log usage
    await supabase.from('usage_logs').insert({
      user_id: userId,
      type: 'semantic_search',
      metadata: {
        query,
        results_count: enhancedResults.length
      }
    })

    return new Response(
      JSON.stringify({
        query,
        results: enhancedResults,
        total: enhancedResults.length
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Semantic search error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})