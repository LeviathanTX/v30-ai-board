// Supabase Edge Function for Document Processing
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode } from 'https://deno.land/x/gpt_encoder/mod.ts'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to extract text from different file types
async function extractText(file: Blob, mimeType: string): Promise<string> {
  // For now, we'll handle text-based files
  // In production, you'd integrate with services like:
  // - PDF: pdf.js or external API
  // - DOCX: mammoth.js or external API
  // - Images: OCR service
  
  if (mimeType.includes('text') || mimeType.includes('json')) {
    return await file.text()
  }
  
  // Placeholder for other file types
  throw new Error(`Unsupported file type: ${mimeType}`)
}

// Generate embeddings using OpenAI
async function generateEmbeddings(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text,
    }),
  })

  const data = await response.json()
  return data.data[0].embedding
}

// Generate document summary using Claude
async function generateSummary(text: string): Promise<{
  summary: string
  keyPoints: string[]
  entities: any
}> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Analyze this document and provide:
1. A concise summary (2-3 sentences)
2. 3-5 key points as an array
3. Important entities (people, companies, dates, amounts)

Document:
${text.substring(0, 10000)} // Limit context

Respond in JSON format:
{
  "summary": "...",
  "keyPoints": ["point1", "point2", ...],
  "entities": {
    "people": [],
    "companies": [],
    "dates": [],
    "amounts": []
  }
}`
      }]
    }),
  })

  const data = await response.json()
  return JSON.parse(data.content[0].text)
}

// Chunk text for embeddings
function chunkText(text: string, maxTokens: number = 500): string[] {
  const sentences = text.split(/[.!?]+/)
  const chunks: string[] = []
  let currentChunk = ''
  let currentTokens = 0

  for (const sentence of sentences) {
    const sentenceTokens = encode(sentence).length
    
    if (currentTokens + sentenceTokens > maxTokens) {
      if (currentChunk) chunks.push(currentChunk.trim())
      currentChunk = sentence
      currentTokens = sentenceTokens
    } else {
      currentChunk += ' ' + sentence
      currentTokens += sentenceTokens
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim())
  return chunks
}

serve(async (req) => {
  try {
    const { documentId } = await req.json()

    // Get document from database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError) throw docError

    // Update status to processing
    await supabase
      .from('documents')
      .update({ status: 'processing' })
      .eq('id', documentId)

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(document.storage_bucket)
      .download(document.storage_path)

    if (downloadError) throw downloadError

    // Extract text
    const text = await extractText(fileData, document.mime_type)

    // Generate summary and analysis
    const analysis = await generateSummary(text)

    // Chunk text for embeddings
    const chunks = chunkText(text)

    // Generate embeddings for each chunk
    const embeddings = []
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbeddings(chunks[i])
      
      embeddings.push({
        document_id: documentId,
        chunk_index: i,
        chunk_text: chunks[i],
        embedding,
        metadata: {
          tokens: encode(chunks[i]).length
        }
      })
    }

    // Store embeddings
    const { error: embeddingError } = await supabase
      .from('document_embeddings')
      .insert(embeddings)

    if (embeddingError) throw embeddingError

    // Update document with results
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        content: text,
        summary: analysis.summary,
        key_points: analysis.keyPoints,
        entities: analysis.entities,
        analysis,
        status: 'ready',
        processing_time_ms: Date.now() - new Date(document.created_at).getTime()
      })
      .eq('id', documentId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, documentId }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Document processing error:', error)

    // Update document status to failed
    if (req.body) {
      const { documentId } = await req.json()
      await supabase
        .from('documents')
        .update({ 
          status: 'failed',
          error_message: error.message 
        })
        .eq('id', documentId)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})