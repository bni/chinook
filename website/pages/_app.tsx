import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { AppProps } from "next/app";

import { mantineTheme } from "@lib/theme";

import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";

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
