import "mantine-datatable/styles.layer.css";
import "@mantine/core/styles.layer.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { mantineTheme } from "@lib/theme";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000
        }
      }
    })
  );

  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      <ModalsProvider>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </ModalsProvider>
    </MantineProvider>
  );
}
