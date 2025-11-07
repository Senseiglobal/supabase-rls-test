import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, TrendingUp, FileText, Calendar } from "lucide-react";

const Reports = () => {
  // DEMO DATA - Replace with Supabase-generated reports later
  const reports = [
    { 
      title: "Monthly Performance Report",
      description: "Comprehensive analysis of your music performance for the past month",
      date: "January 2024",
      type: "Performance"
    },
    { 
      title: "Audience Insights Report",
      description: "Detailed breakdown of listener demographics and engagement patterns",
      date: "Q4 2023",
      type: "Analytics"
    },
    { 
      title: "Growth Trends Report",
      description: "Track your follower growth and streaming trends over time",
      date: "2023 Annual",
      type: "Trends"
    },
  ];

  return (
    <>
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Reports</h1>
        <p className="text-sm md:text-base text-foreground/70">Generate and download custom analytics reports</p>
      </div>

        {/* Generate New Report */}
        <Card className="p-8 mb-8 card-urban border-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Generate Custom Report</h3>
              <p className="text-foreground/70">Create a personalized report with AI-powered insights</p>
            </div>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </div>
        </Card>

        {/* Available Reports */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-foreground">Available Reports</h2>
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report, idx) => (
              <Card key={idx} className="p-6 card-urban card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1 text-foreground">{report.title}</h3>
                      <p className="text-sm text-foreground/70 mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-foreground/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {report.date}
                        </span>
                        <span className="px-2 py-1 rounded-md bg-secondary text-foreground/70">
                          {report.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
    </>
  );
};

export default Reports;
