import Head from "next/head";

const generateTitle = (pageName?: string, subPageName?: string) => {
  let title = "C H I N O O K";

  if (pageName) {
    title += ` → ${pageName}`;
  }

  if (subPageName) {
    title += ` → ${subPageName}`;
  }

  return title;
};

interface HeadComponentProps {
  pageName?: string;
  subPageName?: string;
}

export function HeadComponent({ pageName, subPageName }: HeadComponentProps) {
  const title = generateTitle(pageName, subPageName);

  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"/>
      <link rel="icon" href="/favicon_16x16.png" type="image/png" sizes="16x16"/>
      <link rel="icon" href="/favicon_32x32.png" type="image/png" sizes="32x32"/>
      <link rel="icon" href="/favicon_64x64.png" type="image/png" sizes="64x64"/>
      <link rel="icon" href="/favicon_128x128.png" type="image/png" sizes="128x128"/>
      <link rel="icon" href="/favicon_256x256.png" type="image/png" sizes="256x256"/>
      <link rel="icon" href="/favicon_512x512.png" type="image/png" sizes="512x512"/>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
    </Head>
  );
}
