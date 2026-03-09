// Landing page is served by src/app/page.tsx directly (no route conflict).
// This file intentionally left as a passthrough redirect.
import { redirect } from "next/navigation";
export default function PublicHomePage() {
  redirect("/");
}
