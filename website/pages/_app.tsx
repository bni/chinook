import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import Head from "next/head";
import type { AppProps } from "next/app";

import { mantineTheme } from "@lib/theme";

import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
      <ModalsProvider>
        <Head>
          <title>Home Page</title>
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
          <link rel="shortcut icon" href="/favicon.svg" />
        </Head>
        <Component {...pageProps} />
      </ModalsProvider>
    </MantineProvider>
  );
}
