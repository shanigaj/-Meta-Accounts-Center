import { redirect } from "next/navigation";

// Landing simply forwards into the app; the middleware decides whether the
// visitor lands on the dashboard or gets bounced to the login screen.
export default function Home() {
  redirect("/dashboard");
}
