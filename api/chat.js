// api/chat.js - Vercel Serverless Function for Claude API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Verify user authentication
async function verifyUser(token) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Check usage limits
async function checkUsageLimits(userId) {
  const { data, error } = await supabase.rpc('check_user_limits', {
    user_id: userId,
    limit_type: 'conversations'
  });
  
  if (error) throw error;
  return data;
}

// Log usage
async function logUsage(userId, tokens, conversationId) {
  await supabase.from('usage_logs').insert({
    user_id: userId,
    type: 'ai_conversation',
    resource_id: conversationId,
    resource_type: 'conversation',
    tokens_used: tokens
  });
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get auth token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    // Verify user
    const user = await verifyUser(token);
    
    // Check usage limits
    const canProceed = await checkUsageLimits(user.id);
    if (!canProceed) {
      return res.status(429).json({ error: 'Usage limit exceeded' });
    }

    const { messages, model = 'claude-3-opus-20240229', stream = true, conversationId } = req.body;

    // Make request to Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 4000,
        stream
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    if (stream) {
      // Set up SSE headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let tokenCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Log usage
              await logUsage(user.id, tokenCount, conversationId);
              res.write(`data: [DONE]\n\n`);
              res.end();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.usage) {
                tokenCount = parsed.usage.input_tokens + parsed.usage.output_tokens;
              }
              res.write(`data: ${data}\n\n`);
            } catch (e) {
              // Forward as-is if not JSON
              res.write(`${line}\n`);
            }
          }
        }
      }
    } else {
      // Non-streaming response
      const data = await response.json();
      
      // Log usage
      if (data.usage) {
        await logUsage(
          user.id, 
          data.usage.input_tokens + data.usage.output_tokens,
          conversationId
        );
      }

      res.status(200).json(data);
    }
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: error.message });
  }
}