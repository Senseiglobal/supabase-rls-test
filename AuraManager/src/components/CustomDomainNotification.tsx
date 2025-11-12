import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const CustomDomainNotification = () => {
  return (
    <Card className="w-full bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <CheckCircle className="h-5 w-5" />
          ✅ Custom Domain Active
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Badge variant="outline" className="mb-2">Production URL</Badge>
          <p className="text-sm font-mono bg-green-100 dark:bg-green-900/30 p-2 rounded">
            https://auramanager.app
          </p>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            ✅ Stable domain - Perfect for OAuth redirects!
          </p>
        </div>
        
        <div>
          <Badge variant="outline" className="mb-1">Spotify OAuth Setup</Badge>
          <p className="text-xs text-green-700 dark:text-green-300">
            Use this redirect URI in Spotify Developer Console:
          </p>
          <p className="text-xs font-mono bg-green-100 dark:bg-green-900/30 p-1 rounded mt-1">
            https://auramanager.app/account?connected=spotify
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomDomainNotification;