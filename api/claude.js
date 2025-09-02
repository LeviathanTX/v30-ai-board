// api/claude.js
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    
    // Get API key from request body (client provides it)
    const apiKey = body.apiKey || process.env.ANTHROPIC_API_KEY;
    
    // Debug logging
    console.log('API Key received:', apiKey ? 'Present' : 'Missing');
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 7) + '...' : 'N/A');
    
    if (!apiKey) {
      console.log('No API key provided in request');
      return new Response(
        JSON.stringify({ error: 'API key not provided' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    const trimmedKey = apiKey.trim();
    if (!trimmedKey || trimmedKey.length < 5) {
      console.log('Invalid API key format - too short:', trimmedKey.length);
      return new Response(
        JSON.stringify({ error: 'Invalid API key format' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
    
    // Remove apiKey from the body before sending to Anthropic
    const { apiKey: _, ...anthropicBody } = body;

    // Forward request to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': trimmedKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    });

    const data = await response.json();

    // Log response for debugging
    if (!response.ok) {
      console.error('Anthropic API Error:', response.status, data);
    }

    // Return response with CORS headers
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
