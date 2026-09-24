

import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import router from "./router";
import queryClient from "./queryClient";
import { AuthProvider } from "../features/auth/context/Authcontext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600" />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
