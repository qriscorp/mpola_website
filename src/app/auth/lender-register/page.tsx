import { redirect } from "next/navigation";

export default function LenderRegisterPage() {
  redirect("/auth/register?portal=lender");
}
