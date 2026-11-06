import { Legal, legalMetadata } from "@/components/Legal";

export const dynamic = "force-dynamic";
export const metadata = legalMetadata("cookies");

export default function Page() {
  return <Legal doc="cookies" />;
}
