import { Modal, TextInput, Button, Stack, Text, Divider, Title, ActionIcon } from "@mantine/core";
import { useState } from "react";
import { authClient } from "@lib/client";
import { useRouter } from "next/router";
import { IconBrandGithub, IconBrandGoogle, IconBrandAzure, IconUser } from "@tabler/icons-react";

interface AuthModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AuthModal({ opened, onClose }: AuthModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const session = authClient.useSession();

  const handleLogin = async () => {
    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password
      });

      if (error) {
        alert("Login Error: " + JSON.stringify(error));
      } else {
        onClose();
      }
    } catch (err) {
      alert("Login Error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name
      });

      if (error) {
        alert("Signup Error: " + JSON.stringify(error));
      } else {
        onClose();
      }
    } catch (err) {
      alert("Signup Error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authClient.signOut();

      onClose();

      await router.push("/");
    } catch (err) {
      alert("Logout Error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "github"
      });
    } catch (err) {
      alert("GitHub Login Error: " + JSON.stringify(err));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google"
      });
    } catch (err) {
      alert("Google Login Error: " + JSON.stringify(err));
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "microsoft"
      });
    } catch (err) {
      alert("Microsoft Login Error: " + JSON.stringify(err));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      overlayProps={{
        blur: 10
      }}
    >
      <Stack>
        {!session.data ? (
          <>
            <Title order={2} ta="center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              {isLogin ? "Sign in to your account with" : "Sign up with to get started"}
            </Text>

            <Stack>
              <Button
                onClick={handleMicrosoftLogin}
                disabled
                variant="default"
                leftSection={<IconBrandAzure size="14" stroke={1.5} />}
                rightSection={<span />}
                fullWidth
                justify="space-between"
              >
                Microsoft
              </Button>

              <Button
                onClick={handleGoogleLogin}
                disabled
                variant="default"
                leftSection={<IconBrandGoogle size="14" stroke={1.5} />}
                rightSection={<span />}
                fullWidth
                justify="space-between"
              >
                Google
              </Button>

              <Button
                onClick={handleGithubLogin}
                disabled
                variant="default"
                leftSection={<IconBrandGithub size="14" stroke={1.5} />}
                rightSection={<span />}
                fullWidth
                justify="space-between"
              >
                GitHub
              </Button>

            </Stack>

            <Divider label="OR" labelPosition="center" my="md" />

            <Stack>
              {!isLogin && (
                <TextInput
                  label="Name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  disabled={loading}
                />
              )}
              <TextInput
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                disabled={loading}
                type="email"
              />
              <TextInput
                label="Password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                disabled={loading}
              />

              <Button
                onClick={isLogin ? handleLogin : handleSignup}
                disabled={loading || !email || !password || (!isLogin && !name)}
                fullWidth
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </Stack>

            <Text ta="center" size="sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text
                component="span"
                c="blue"
                style={{ cursor: "pointer" }}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Text>
            </Text>
          </>
        ) : (
          <>
            <ActionIcon variant="default" size="xl" ta="center" aria-label="User icon" >
              <IconUser stroke={1.5} />
            </ActionIcon>
            <Title order={2} ta="center">
              Hello, {session.data.user.name}.
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              You are currently logged in
            </Text>
            <Divider />
            <Button
              onClick={handleLogout}
              disabled={loading}
              color="red"
              variant="subtle"
              fullWidth
            >
              Sign Out
            </Button>
          </>
        )}
      </Stack>
    </Modal>
  );
}
