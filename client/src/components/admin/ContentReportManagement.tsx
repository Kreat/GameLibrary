import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle, Search, Flag, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

// Report type from server
interface ContentReport {
  id: number;
  reporterId: number;
  contentType: string;
  contentId: number;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewerId: number | null;
  actionTaken: string | null;
  reporter?: {
    id: number;
    username: string;
    displayName: string | null;
  };
}

export default function ContentReportManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionTaken, setActionTaken] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all content reports
  const { data: reports, isLoading } = useQuery<ContentReport[]>({
    queryKey: ["/api/admin/content-reports"],
    queryFn: async () => {
      const res = await fetch("/api/admin/content-reports");
      if (!res.ok) {
        throw new Error("Failed to fetch content reports");
      }
      return res.json();
    }
  });

  // Fetch pending content reports
  const { data: pendingReports, isLoading: isPendingLoading } = useQuery<ContentReport[]>({
    queryKey: ["/api/admin/content-reports/pending"],
    queryFn: async () => {
      const res = await fetch("/api/admin/content-reports/pending");
      if (!res.ok) {
        throw new Error("Failed to fetch pending reports");
      }
      return res.json();
    }
  });

  // Update report status mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, actionTaken }: { reportId: number, status: string, actionTaken?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/content-reports/${reportId}`, { 
        status, 
        actionTaken 
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update report status");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report updated",
        description: "The report status has been updated successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content-reports/pending"] });
      setIsDialogOpen(false);
      setSelectedReport(null);
      setActionTaken("");
      setNewStatus("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Get the appropriate reports based on active tab
  const getFilteredReports = () => {
    let filteredData = [];
    
    if (activeTab === "pending") {
      filteredData = pendingReports || [];
    } else {
      filteredData = reports?.filter(report => 
        activeTab === "all" || report.status === activeTab
      ) || [];
    }

    // Apply search filter
    if (searchQuery) {
      return filteredData.filter(report => 
        report.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.details && report.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
        report.contentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.reporter && report.reporter.username.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filteredData;
  };

  // Handle report action
  const handleReportAction = (report: ContentReport, status: string) => {
    setSelectedReport(report);
    setNewStatus(status);
    setActionTaken("");
    setIsDialogOpen(true);
  };

  // Submit action
  const submitAction = () => {
    if (!selectedReport || !newStatus) return;
    
    updateReportMutation.mutate({ 
      reportId: selectedReport.id, 
      status: newStatus,
      actionTaken: actionTaken || undefined
    });
  };

  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-gray-100 text-gray-800";
      case "actioned":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading && isPendingLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredReports = getFilteredReports();

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
          <TabsTrigger value="actioned">Actioned</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Content Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.reporter?.username || report.reporterId}</TableCell>
                  <TableCell className="capitalize">{report.contentType}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReportAction(report, "actioned")}
                        disabled={updateReportMutation.isPending || report.status === "actioned"}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Action
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleReportAction(report, "rejected")}
                        disabled={updateReportMutation.isPending || report.status === "rejected"}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  {searchQuery 
                    ? "No reports match your search." 
                    : activeTab === "pending" 
                      ? "No pending reports found." 
                      : "No reports found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Tabs>

      {/* Report action dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {newStatus === "actioned" ? "Take Action on Report" : "Reject Report"}
            </DialogTitle>
            <DialogDescription>
              {newStatus === "actioned" 
                ? "Describe what action you're taking to address this report." 
                : "Explain why you're rejecting this report."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border rounded-md p-4 bg-muted/50">
              <div className="text-sm font-medium">Report Details</div>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-muted-foreground text-sm">Type:</span>{" "}
                  <span className="capitalize">{selectedReport?.contentType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Reason:</span>{" "}
                  {selectedReport?.reason}
                </div>
                {selectedReport?.details && (
                  <div>
                    <span className="text-muted-foreground text-sm">Details:</span>{" "}
                    {selectedReport.details}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {newStatus === "actioned" ? "Action taken" : "Reason for rejection"}
              </label>
              <Textarea
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                rows={3}
                placeholder={
                  newStatus === "actioned"
                    ? "Describe the action you've taken..."
                    : "Explain why this report is being rejected..."
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitAction}
              disabled={updateReportMutation.isPending}
            >
              {updateReportMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {newStatus === "actioned" ? "Confirm Action" : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}