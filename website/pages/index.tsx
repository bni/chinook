import { Text, Stack } from "@mantine/core";
import { CollapseDesktop } from "@components/CollapseDesktop";
import { AuthModal } from "@components/AuthModal";
import { useState } from "react";
import { HeadComponent } from "@components/HeadComponent";
import { authClient } from "@lib/client";

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
