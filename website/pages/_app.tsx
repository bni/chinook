import { createTheme, MantineColorsTuple, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import Head from "next/head";
import type { AppProps } from "next/app";

import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";

const skyBlue: MantineColorsTuple = [
  "#e1f8ff",
  "#cbedff",
  "#9ad7ff",
  "#64c1ff",
  "#3aaefe",
  "#20a2fe",
  "#099cff",
  "#0088e4",
  "#0079cd",
  "#0068b6"
];

const theme = createTheme({
  colors: {
    skyBlue: skyBlue
  },
  primaryColor: "skyBlue",
  fontSizes: {
    xs: "20px",
    sm: "21px",
    md: "24px",
    lg: "26px",
    xl: "30px"
  }
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
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
