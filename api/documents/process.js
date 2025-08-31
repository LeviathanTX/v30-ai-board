// api/documents/process.js - Document processing endpoint
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs/promises';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req) {
  const form = formidable({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify auth
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parse form data
    const { files } = await parseForm(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read file
    const fileBuffer = await fs.readFile(file.filepath);
    
    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.originalFilename}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, fileBuffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Create database record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: file.originalFilename,
        original_name: file.originalFilename,
        type: file.mimetype,
        mime_type: file.mimetype,
        size: file.size,
        storage_path: uploadData.path,
        status: 'processing'
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    // Trigger edge function for processing
    const { error: functionError } = await supabase.functions.invoke('process-document', {
      body: { documentId: document.id }
    });

    if (functionError) {
      console.error('Edge function error:', functionError);
      // Update status to failed
      await supabase
        .from('documents')
        .update({ status: 'failed' })
        .eq('id', document.id);
    }

    // Clean up temp file
    await fs.unlink(file.filepath);

    res.status(200).json({ document });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: error.message });
  }
}