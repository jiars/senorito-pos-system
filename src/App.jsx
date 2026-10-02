import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRoutes from "./routes/AppRoutes";
import { Skeleton } from "./components/ui/skeleton";

const PrintTestPage = lazy(() => import("./pages/print-test/PrintTestPage"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sample-only tool: no session lookup, business queries, or order sync. */}
        <Route path="/print-test" element={
          <Suspense fallback={
            <main className="mx-auto max-w-6xl space-y-6 p-8" aria-busy="true" aria-label="Loading printing tests">
              <Skeleton className="h-10 w-60" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-96 w-full" />
            </main>
          }>
            <PrintTestPage />
          </Suspense>
        } />
        <Route path="*" element={
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
