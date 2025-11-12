-- Create storage bucket for music uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music-uploads',
  'music-uploads',
  false,
  52428800, -- 50MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg']
);

-- Create RLS policies for music uploads bucket
CREATE POLICY "Users can view their own music uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'music-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own music"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own music uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'music-uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create uploads table to track user uploads and AI analysis
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  ai_analysis JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for uploads
CREATE POLICY "Users can view their own uploads"
ON public.uploads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
ON public.uploads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
ON public.uploads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
ON public.uploads FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_uploads_updated_at
BEFORE UPDATE ON public.uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get user's monthly upload count
CREATE OR REPLACE FUNCTION public.get_monthly_upload_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  upload_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO upload_count
  FROM public.uploads
  WHERE user_id = user_uuid
    AND created_at >= DATE_TRUNC('month', NOW());
  
  RETURN upload_count;
END;
$$;