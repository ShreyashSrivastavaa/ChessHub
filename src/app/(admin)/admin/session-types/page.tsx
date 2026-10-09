import { redirect } from "next/navigation";

export default function AdminSessionTypesRedirect() {
  redirect("/admin/availability");
}
