-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    username TEXT UNIQUE,
    website TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for avatars (run this in Supabase Dashboard -> Storage)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars bucket
-- CREATE POLICY "Avatar images are publicly accessible"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload their own avatar"
--     ON storage.objects FOR INSERT
--     WITH CHECK (
--         bucket_id = 'avatars' 
--         AND auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can update their own avatar"
--     ON storage.objects FOR UPDATE
--     USING (
--         bucket_id = 'avatars' 
--         AND auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can delete their own avatar"
--     ON storage.objects FOR DELETE
--     USING (
--         bucket_id = 'avatars' 
--         AND auth.uid()::text = (storage.foldername(name))[1]
--     );
