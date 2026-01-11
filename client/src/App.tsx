import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";
import GlobalFooter from "@/components/GlobalFooter";

// Eager load the main feed page for fastest LCP
import Feed from "@/pages/feed";

// Lazy load all other pages to reduce initial bundle size
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const PostDetail = lazy(() => import("@/pages/post-detail"));
const Profile = lazy(() => import("@/pages/profile"));
const ProfilesList = lazy(() => import("@/pages/profiles-list"));
const UserActivity = lazy(() => import("@/pages/user-activity"));
const Filters = lazy(() => import("@/pages/filters"));
const Settings = lazy(() => import("@/pages/settings"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Cookies = lazy(() => import("@/pages/cookies"));
const Contact = lazy(() => import("@/pages/contact"));
const About = lazy(() => import("@/pages/about"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));

// Loading fallback for lazy-loaded pages
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Main feed - eagerly loaded for fastest LCP */}
        <Route path="/" component={Feed} />
        <Route path="/home">{() => <Redirect to="/" />}</Route>

        {/* Lazy-loaded pages */}
        <Route path="/welcome" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/posts/:postId" component={PostDetail} />
        <Route path="/profiles" component={ProfilesList} />
        <Route path="/profiles/:profileId" component={Profile} />
        <Route path="/users/:userId" component={UserActivity} />
        <Route path="/filters" component={Filters} />
        <Route path="/settings" component={Settings} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/contact" component={Contact} />
        <Route path="/about" component={About} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route>{() => <Redirect to="/" />}</Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <GlobalFooter />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
