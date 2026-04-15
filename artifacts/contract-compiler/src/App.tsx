import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  console.log("Current Path:", window.location.pathname);

  const basePath = import.meta.env.BASE_URL || "/";

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={basePath}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
