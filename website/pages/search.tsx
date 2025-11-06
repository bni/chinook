import { CollapseDesktop } from "@components/CollapseDesktop";
import { HeadComponent } from "@components/HeadComponent";
import { SemanticSearch } from "@components/search/SemanticSearch";
import { Text, Modal, ActionIcon } from "@mantine/core";
import { useState } from "react";

import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

interface SearchPageProps {
  headers: object
}

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
  return {
    props: {
      headers: context.req.headers
    }
  };
}) satisfies GetServerSideProps<SearchPageProps>;

export default function SearchPage({
  headers
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [opened, setOpened] = useState(false);

  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Search"}/>

      <SemanticSearch/>

      <ActionIcon
        size="lg"
        onClick={() => setOpened(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000
        }}
      >
        π
      </ActionIcon>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Headers"
        size="xl"
      >
        <Text style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "12px" }}>
          {JSON.stringify(headers, null, 2)}
        </Text>
      </Modal>
    </CollapseDesktop>
  );
}
