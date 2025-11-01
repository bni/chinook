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
          <title>C H I N O O K</title>
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"/>
          <link rel="icon" href="/favicon_16x16.png" type="image/png" sizes="16x16"/>
          <link rel="icon" href="/favicon_32x32.png" type="image/png" sizes="32x32"/>
          <link rel="icon" href="/favicon_64x64.png" type="image/png" sizes="64x64"/>
          <link rel="icon" href="/favicon_128x128.png" type="image/png" sizes="128x128"/>
          <link rel="icon" href="/favicon_256x256.png" type="image/png" sizes="256x256"/>
          <link rel="icon" href="/favicon_512x512.png" type="image/png" sizes="512x512"/>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
        </Head>
        <Component {...pageProps} />
      </ModalsProvider>
    </MantineProvider>
  );
}
