import { ActionIcon, AppShell, Burger, Flex, Group, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import ColorSchemeToggler from "./ColorSchemeToggler";
import { IconActivity, IconHome2, IconSearch, IconUser, IconUsersGroup } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { AuthModal } from "./AuthModal";
import { authClient } from "@lib/client";

export function CollapseDesktop({ children }: { children: ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure();
  const [authModalOpened, { open: openAuthModal, close: closeAuthModal }] = useDisclosure(false);
  const { data: session } = authClient.useSession();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
      }}
      padding="md"
    >
      <AppShell.Header>
        <Flex h="100%" w="100%">
          <Group h="100%" px="md">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          </Group>

          <Group h="100%" px="md" ml="auto">
            <ColorSchemeToggler/>

            <ActionIcon variant="default" size="xl" aria-label="User preferences" onClick={openAuthModal}>
              <IconUser stroke={1.5} />
            </ActionIcon>
          </Group>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md">

        <NavLink href={"/"} label="Start" leftSection={<IconHome2 size="1rem" stroke={1.5} />} />
        {session && <NavLink href={"/artists"} label="Artists" leftSection={<IconActivity size="1rem" stroke={1.5} />} />}
        {session && <NavLink href={"/employees"} label="Employees" leftSection={<IconUsersGroup size="1rem" stroke={1.5} />} />}
        {session && <NavLink href={"/search"} label="Search" leftSection={<IconSearch size="1rem" stroke={1.5} />} />}

      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>

      <AuthModal opened={authModalOpened} onClose={closeAuthModal} />
    </AppShell>
  );
}
