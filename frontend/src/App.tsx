import React from "react";
import { RouterProvider } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { store, persistor } from "@/store";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { createAppRouter } from "@/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const App: React.FC = () => {
  const [router] = React.useState(() => createAppRouter());

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                className:
                  "glass rounded-xl border border-border text-sm font-medium text-foreground shadow-lg",
                duration: 4000,
                style: {
                  background: "var(--color-card)",
                  color: "var(--color-foreground)",
                },
                success: {
                  iconTheme: {
                    primary: "var(--color-primary)",
                    secondary: "var(--color-primary-foreground)",
                  },
                },
              }}
            />
            <RouterProvider router={router} />
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;
