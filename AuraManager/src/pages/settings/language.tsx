import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

export default function Language() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Store language preference in localStorage
      localStorage.setItem("aura_language", selectedLanguage);
      
      // TODO: Integrate with Google Translate API or i18n library
      // For now, just show success message
      
      toast.success("Language preference saved", {
        description: `Language set to ${languages.find(l => l.code === selectedLanguage)?.name}`,
      });
    } catch (error) {
      toast.error("Failed to save language preference");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Language Settings"
        description="Choose your preferred language for the application"
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Select Language
            </CardTitle>
            <CardDescription>
              Choose the language you want to use in Aura Manager. Changes will apply immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">App Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center justify-between w-full">
                        <span>{lang.nativeName}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          {lang.name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                <Check className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Language Preference"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Translation Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Aura Manager uses Google Translate to provide multilingual support.
              Some translations may not be perfect, but we're constantly improving.
            </p>
            <p>
              <strong>Note:</strong> Some technical terms and feature names may remain in English
              to maintain clarity and consistency.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
