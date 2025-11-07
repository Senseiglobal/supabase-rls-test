import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Music, Trash2, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type UploadTier = "Free" | "Creator" | "Pro";

interface Upload {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  ai_analysis: any;
  analyzed_at: string | null;
  created_at: string;
}

const TIER_LIMITS: Record<UploadTier, number> = {
  Free: 0,
  Creator: 5,
  Pro: 25,
};

const MyContent = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<UploadTier>("Free");
  const [monthlyCount, setMonthlyCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
    fetchUploads();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan_name")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (subscription) {
      setUserTier(subscription.plan_name as UploadTier);
    }

    const { data: countData } = await supabase.rpc('get_monthly_upload_count', {
      user_uuid: user.id
    });

    setMonthlyCount(countData || 0);
  };

  const fetchUploads = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("uploads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching uploads:", error);
      toast.error("Failed to load uploads");
    } else {
      setUploads(data || []);
    }
    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check tier limits
    const limit = TIER_LIMITS[userTier];
    if (limit === 0) {
      toast.error("Upload feature not available in Free tier. Upgrade to Creator or Pro to unlock AI music analysis.");
      return;
    }

    if (monthlyCount >= limit) {
      toast.error(`Monthly upload limit reached (${limit} tracks). Upgrade your plan for more uploads.`);
      return;
    }

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an audio file (MP3, WAV, M4A, AAC, OGG)");
      return;
    }

    // Validate file size (50MB)
    if (file.size > 52428800) {
      toast.error("File too large. Maximum size is 50MB.");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("music-uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create upload record
      const { data: upload, error: dbError } = await supabase
        .from("uploads")
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success("File uploaded successfully! Starting AI analysis...");
      setMonthlyCount(prev => prev + 1);
      fetchUploads();

      // Trigger AI analysis
      if (upload) {
        analyzeUpload(upload.id);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const analyzeUpload = async (uploadId: string) => {
    setAnalyzing(uploadId);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-song', {
        body: { uploadId }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success(data.cached ? "Analysis retrieved" : "AI analysis complete!");
        fetchUploads();
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze track");
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (upload: Upload) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("music-uploads")
        .remove([upload.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("uploads")
        .delete()
        .eq("id", upload.id);

      if (dbError) throw dbError;

      toast.success("Track deleted");
      fetchUploads();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete track");
    }
  };

  const canUpload = TIER_LIMITS[userTier] > 0 && monthlyCount < TIER_LIMITS[userTier];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">My Content</h1>
            <p className="text-foreground/70">Upload music for AI-powered analytics</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{userTier} Plan</Badge>
              <Badge variant="secondary">
                {monthlyCount} / {TIER_LIMITS[userTier]} uploads this month
              </Badge>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={!canUpload || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Track
              </>
            )}
          </Button>
        </div>

        {/* Upload Zone */}
        <Card 
          className="p-12 mb-8 card-urban border-2 border-dashed border-accent/30 hover:border-accent/50 transition-all duration-300 cursor-pointer"
          onClick={() => canUpload && !uploading && fileInputRef.current?.click()}
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              {canUpload ? "Upload Your Music" : "Upgrade to Upload"}
            </h3>
            <p className="text-foreground/70 mb-4">
              {canUpload 
                ? "Click or drag and drop your audio files (MP3, WAV, M4A, AAC, OGG - Max 50MB)"
                : userTier === "Free" 
                  ? "Upgrade to Creator or Pro plan to unlock AI music analysis"
                  : `Monthly limit reached. Upgrade for more uploads.`
              }
            </p>
          </div>
        </Card>

        {/* Uploads List */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Your Uploads</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : uploads.length === 0 ? (
            <Card className="p-12 text-center">
              <Music className="h-12 w-12 text-foreground/30 mx-auto mb-4" />
              <p className="text-foreground/70">No uploads yet. Upload your first track to get AI insights!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {uploads.map((upload) => (
                <Card key={upload.id} className="p-6 card-urban">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Music className="h-5 w-5 text-accent" />
                        <h3 className="font-semibold text-foreground">{upload.file_name}</h3>
                      </div>
                      <p className="text-sm text-foreground/70 mb-3">
                        {(upload.file_size / 1024 / 1024).toFixed(2)} MB • {upload.mime_type}
                      </p>
                      
                      {upload.ai_analysis ? (
                        <div className="bg-accent/10 rounded-lg p-4 mt-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-accent" />
                            <span className="font-semibold text-sm">AI Analysis</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-foreground/70">Genre:</span>
                              <p className="font-medium">{upload.ai_analysis.genre}</p>
                            </div>
                            <div>
                              <span className="text-foreground/70">Mood:</span>
                              <p className="font-medium">{upload.ai_analysis.mood}</p>
                            </div>
                            <div>
                              <span className="text-foreground/70">Energy:</span>
                              <p className="font-medium capitalize">{upload.ai_analysis.energy_level}</p>
                            </div>
                            <div>
                              <span className="text-foreground/70">Potential:</span>
                              <p className="font-medium capitalize">{upload.ai_analysis.commercial_potential}</p>
                            </div>
                          </div>
                          {upload.ai_analysis.insights && (
                            <p className="mt-3 text-sm text-foreground/80">{upload.ai_analysis.insights}</p>
                          )}
                        </div>
                      ) : analyzing === upload.id ? (
                        <div className="flex items-center gap-2 text-accent mt-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Analyzing with AI...</span>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => analyzeUpload(upload.id)}
                          className="mt-3"
                        >
                          <Sparkles className="mr-2 h-3 w-3" />
                          Analyze with AI
                        </Button>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(upload)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyContent;
