import { Card, Grid, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconMessageLanguage, IconMusic, IconSearch, IconUsersGroup } from "@tabler/icons-react";
import { AuthModal } from "@components/AuthModal";
import { CollapseDesktop } from "@components/CollapseDesktop";
import { HeadComponent } from "@components/HeadComponent";
import { authClient } from "@lib/client";
import { useRouter } from "next/router";
import { useState } from "react";

export default function IndexPage() {
  const [authModalOpened, setAuthModalOpened] = useState(false);
  const session = authClient.useSession();
  const router = useRouter();

  const navigationCards = [
    {
      title: "Search",
      icon: IconSearch,
      path: "/search",
      color: "violet"
    },
    {
      title: "Artists",
      icon: IconMusic,
      path: "/artists",
      color: "blue"
    },
    {
      title: "Speak",
      icon: IconMessageLanguage,
      path: "/speak",
      color: "green"
    },
    {
      title: "Employees",
      icon: IconUsersGroup,
      path: "/employees",
      color: "orange"
    }
  ];

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
        <Stack mt={50} align="center" gap="xl">
          <Text size="xl" fw={500}>
            Welcome, {session.data.user.name}!
          </Text>

          <Grid gutter="xl" style={{ maxWidth: "1200px", width: "100%" }} mt={75}>
            {navigationCards.map((card) => (
              <Grid.Col key={card.path} span={{ base: 12, sm: 6, md: 4 }}>
                <Card
                  shadow="md"
                  padding="xl"
                  radius="md"
                  withBorder
                  style={{
                    cursor: "pointer",
                    height: "250px",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                  onClick={() => router.push(card.path)}
                >
                  <Stack align="center" justify="center" h="100%" gap="lg">
                    <ThemeIcon
                      size={80}
                      radius="md"
                      variant="light"
                      color={card.color}
                    >
                      <card.icon size={48} stroke={1.5} />
                    </ThemeIcon>
                    <Text size="xl" fw={600}>
                      {card.title}
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      )}
    </CollapseDesktop>
  );
}
