import { createTheme, MantineColorsTuple, MantineProvider } from "@mantine/core";
import Head from "next/head";

import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";

const skyBlue: MantineColorsTuple = [
  '#e1f8ff',
  '#cbedff',
  '#9ad7ff',
  '#64c1ff',
  '#3aaefe',
  '#20a2fe',
  '#099cff',
  '#0088e4',
  '#0079cd',
  '#0068b6'
];

const theme = createTheme({
  colors: {
    skyBlue: skyBlue
  },
  primaryColor: 'skyBlue'
});

export default function App({ Component, pageProps }: any) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Head>
        <title>Home Page</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </MantineProvider>
  );
}
