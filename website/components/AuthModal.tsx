import { Modal, TextInput, Button, Stack, Group } from "@mantine/core";
import { useState } from "react";
import { authClient } from "@lib/client";
import { useRouter } from "next/router";

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

  const handleLogin = async () => {
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password
      });

      if (error) {
        alert("Login Error: " + JSON.stringify(error));
      } else {
        alert("Login Success! " + JSON.stringify(data));

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
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name
      });

      if (error) {
        alert("Signup Error: " + JSON.stringify(error));
      } else {
        alert("Signup Success!" + JSON.stringify(data));

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

      alert("Logged out successfully!");

      onClose();

      await router.push("/");
    } catch (err) {
      alert("Logout Error: " + JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Login or sign up" centered>
      <Stack>
        <TextInput
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          disabled={loading}
        />
        <TextInput
          label="Password"
          placeholder="Your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          disabled={loading}
        />
        <TextInput
          label="Name (for signup)"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          disabled={loading}
        />
        <Group grow>
          <Button onClick={handleLogin} disabled={loading || !email || !password}>
            Login
          </Button>
          <Button onClick={handleSignup} disabled={loading || !email || !password}>
            Signup
          </Button>
        </Group>
        <Button onClick={handleLogout} disabled={loading} color="red" variant="light">
          Logout
        </Button>
      </Stack>
    </Modal>
  );
}
