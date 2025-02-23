import "@mantine/core/styles.css";
import Head from "next/head";
import { createTheme, MantineColorsTuple, MantineProvider } from "@mantine/core";

const lightBlue: MantineColorsTuple = [
  '#dffbff',
  '#caf2ff',
  '#99e2ff',
  '#64d2ff',
  '#3cc4fe',
  '#23bcfe',
  '#09b8ff',
  '#00a1e4',
  '#008fcd',
  '#007cb6'
];

const theme = createTheme({
  colors: {
    lightBlue: lightBlue
  },
  primaryColor: 'lightBlue'
});

export default function App({ Component, pageProps }: any) {
  return (
    <MantineProvider theme={theme}>
      <Head>
        <title>Home Page</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <Component {...pageProps} />
    </MantineProvider>
  );
}
