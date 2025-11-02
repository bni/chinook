import { CollapseDesktop } from "@components/CollapseDesktop";
import { Stack, Text } from "@mantine/core";
import { AuthModal } from "@components/AuthModal";
import { useState } from "react";
import { authClient } from "@lib/client";
import { HeadComponent } from "@components/HeadComponent";

export default function IndexPage() {
  const [authModalOpened, setAuthModalOpened] = useState(false);
  const session = authClient.useSession();

  return (
    <CollapseDesktop>
      <HeadComponent pageName={"Welcome"}/>
      <AuthModal opened={authModalOpened} onClose={() => setAuthModalOpened(false)} />
      {!session.data && (
        <Stack mt={50} align="center" gap="md">
          <Text size="xl" fw={500}>
            To get started,{" "}
            <Text
              component="span"
              c="blue"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setAuthModalOpened(true)}
            >
              please sign in
            </Text>
            .
          </Text>
        </Stack>
      )}

      {session.data && (
        <Stack mt={50} align="center" gap="md">
          <Text size="xl" fw={500}>
            Welcome, {session.data.user.name}!
          </Text>
        </Stack>
      )}
    </CollapseDesktop>
  );
}
