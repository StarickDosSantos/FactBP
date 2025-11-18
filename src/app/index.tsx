// src/app/index.tsx
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home"); // Redireciona para Home na inicialização
  }, [router]);

  return null;
}
