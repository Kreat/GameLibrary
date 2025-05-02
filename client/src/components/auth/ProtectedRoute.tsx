import { Redirect, Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { PageTransition } from "@/components/ui/page-transition";

type ProtectedRouteProps = {
  path: string;
  component: React.ComponentType;
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {isLoading ? (
        <PageTransition>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </PageTransition>
      ) : user ? (
        <PageTransition>
          <Component />
        </PageTransition>
      ) : (
        <Redirect to="/auth" />
      )}
    </Route>
  );
}