import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { CollapseDesktop } from "@components/CollapseDesktop";
import { Group } from "@mantine/core";
import { HeadComponent } from "@components/HeadComponent";
import { TranslateComponent } from "@components/translate/TranslateComponent";

interface TranslatePageProps {
  something: string;
}

export const getServerSideProps = (async () => {
  return {
    props: {
      something: "something"
    }
  };
}) satisfies GetServerSideProps<TranslatePageProps>;

export default function ArtistsPage({

}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Translator"}/>
      <Group mt={25} ml={25} mr={25} justify="space-between" grow>
        <TranslateComponent/>
      </Group>
    </CollapseDesktop>
  );
}
