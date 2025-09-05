import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // redireciona automaticamente para /login
}
