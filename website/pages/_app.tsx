import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import type { AppProps } from "next/app";

import { mantineTheme } from "@lib/theme";

import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
      <ModalsProvider>
        <Component {...pageProps} />
      </ModalsProvider>
    </MantineProvider>
  );
}
