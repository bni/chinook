import { CollapseDesktop } from "@components/CollapseDesktop";
import { HeadComponent } from "@components/HeadComponent";
import { SemanticSearch } from "@components/search/SemanticSearch";

import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

interface SearchPageProps {
  blah: string
}

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  const blah = `Hello: ${JSON.stringify(context.req.headers)}`;

  return {
    props: {
      blah: blah
    }
  };
}) satisfies GetServerSideProps<SearchPageProps>;

export default function SearchPage({
  blah
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Search"}/>
      {blah}
      <SemanticSearch/>
    </CollapseDesktop>
  );
}
