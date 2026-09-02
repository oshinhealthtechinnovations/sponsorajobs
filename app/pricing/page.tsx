import { redirect } from "next/navigation";

/**
 * /pricing has been removed.
 * Redirect anyone visiting this URL to the homepage.
 */
export default function PricingPage() {
  redirect("/");
}
