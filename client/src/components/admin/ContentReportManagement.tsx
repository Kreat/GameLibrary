import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

type ContentReport = {
  id: number;
  createdAt: string;
  reporterName: string;
  contentType: string;
  contentId: number;
  reason: string;
  details: string;
  status: string;
  actionTaken: string | null;
};

const ContentReportManagement = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionText, setActionText] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setLoadingError(null);
        const response = await apiRequest("GET", "/api/admin/reports");
        if (!response.ok) {
          throw new Error("Failed to fetch content reports");
        }
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoadingError("Failed to load content reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleActionSubmit = async (reportId: number, status: string) => {
    try {
      setProcessingAction(true);
      const response = await apiRequest("PATCH", `/api/admin/reports/${reportId}/status`, {
        status,
        actionTaken: actionText
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update report status");
      }
      
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status, actionTaken: actionText } : report
      ));
      
      toast({
        title: "Report updated",
        description: `Report has been marked as ${status}`,
        variant: "default",
      });

      setActionDialogOpen(false);
      setActionText("");
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update report status",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const openActionDialog = (report: ContentReport) => {
    setSelectedReport(report);
    setActionText(report.actionTaken || "");
    setActionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const filteredReports = reports.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.reporterName.toLowerCase().includes(searchLower) ||
      report.contentType.toLowerCase().includes(searchLower) ||
      report.reason.toLowerCase().includes(searchLower) ||
      report.details.toLowerCase().includes(searchLower) ||
      report.status.toLowerCase().includes(searchLower)
    );
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    // Sort by status (pending first)
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    
    // Then by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-meeple" />
        <span className="ml-2">Loading content reports...</span>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-boardRed mb-2" />
        <p className="text-boardRed font-medium">{loadingError}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {sortedReports.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedReports.map((report) => (
            <Card key={report.id} className={`
              ${report.status === "pending" ? "border-yellow-300 dark:border-yellow-800" : ""}
              ${report.status === "resolved" ? "border-green-300 dark:border-green-800" : ""}
              ${report.status === "rejected" ? "border-red-300 dark:border-red-800" : ""}
            `}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {report.contentType} Report #{report.id}
                    </CardTitle>
                    <CardDescription>
                      Reported by {report.reporterName} on {new Date(report.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-1">
                  <div className="font-medium text-sm text-foreground">Reason:</div>
                  <div className="text-sm text-muted-foreground">{report.reason}</div>
                </div>
                
                <div className="space-y-1 mt-3">
                  <div className="font-medium text-sm text-foreground">Details:</div>
                  <div className="text-sm text-muted-foreground max-h-20 overflow-y-auto">{report.details}</div>
                </div>

                {report.actionTaken && (
                  <div className="space-y-1 mt-3 p-2 bg-muted rounded-md">
                    <div className="font-medium text-xs text-foreground">Action taken:</div>
                    <div className="text-xs text-muted-foreground">{report.actionTaken}</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex w-full justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => {}}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Content
                  </Button>
                  {report.status === "pending" && (
                    <div className="space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                        onClick={() => openActionDialog(report)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300"
                        onClick={() => openActionDialog(report)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  )}
                  {report.status !== "pending" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                      onClick={() => openActionDialog(report)}
                    >
                      Edit action
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-md">
          <p className="text-muted-foreground">No content reports found.</p>
        </div>
      )}

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedReport?.status === "pending" ? "Take Action on Report" : "Edit Action"}
            </DialogTitle>
            <DialogDescription>
              {selectedReport?.status === "pending" 
                ? "Decide whether to resolve or reject this report and provide details about the action taken."
                : "Update the action taken for this report."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedReport?.status === "pending" && (
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className={`justify-center py-6 ${
                    selectedReport?.status === "resolved" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""
                  }`}
                  onClick={() => setSelectedReport(prev => prev ? { ...prev, status: "resolved" } : null)}
                >
                  <div className="flex flex-col items-center">
                    <CheckCircle className={`h-8 w-8 mb-1 ${
                      selectedReport?.status === "resolved" ? "text-green-500" : "text-muted-foreground"
                    }`} />
                    <span className={selectedReport?.status === "resolved" ? "text-green-600 font-medium" : ""}>
                      Resolve Report
                    </span>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className={`justify-center py-6 ${
                    selectedReport?.status === "rejected" ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""
                  }`}
                  onClick={() => setSelectedReport(prev => prev ? { ...prev, status: "rejected" } : null)}
                >
                  <div className="flex flex-col items-center">
                    <XCircle className={`h-8 w-8 mb-1 ${
                      selectedReport?.status === "rejected" ? "text-red-500" : "text-muted-foreground"
                    }`} />
                    <span className={selectedReport?.status === "rejected" ? "text-red-600 font-medium" : ""}>
                      Reject Report
                    </span>
                  </div>
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="action" className="text-sm font-medium">
                Action taken:
              </label>
              <Textarea
                id="action"
                placeholder="Describe what action was taken..."
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialogOpen(false)}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedReport) {
                  const status = selectedReport.status === "pending" ? "resolved" : selectedReport.status;
                  handleActionSubmit(selectedReport.id, status);
                }
              }}
              disabled={processingAction || !selectedReport || !actionText.trim()}
              className={`
                ${selectedReport?.status === "resolved" ? "bg-green-600 hover:bg-green-700" : ""}
                ${selectedReport?.status === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
              `}
            >
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                selectedReport?.status === "pending" 
                  ? "Submit Action" 
                  : "Update Action"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentReportManagement;