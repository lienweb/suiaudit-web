"use client";

import FeatureCard from "@/components/FeatureCard";
import { BLOCKLIST_REPORT_URL, cleanupAppFeatures } from "@/constants";
import FlagIcon from "@heroicons/react/24/solid/esm/FlagIcon";
import NoSymbolIcon from "@heroicons/react/24/solid/esm/NoSymbolIcon";
import { useRouter } from "next/navigation";

export default function CleanUpPage() {
  const router = useRouter();

  const menuIconClassName = "h-8 w-8 text-gray-400";

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4 p-6 pt-0">
      <FeatureCard
        title={cleanupAppFeatures.blocklist}
        icon={<NoSymbolIcon className={menuIconClassName} />}
        onClick={() => router.push("/sui-wallet-cleanup-app/blocklist")}
      />
      <FeatureCard
        title={cleanupAppFeatures.blocklistReport}
        icon={<FlagIcon className={menuIconClassName} />}
        onClick={() => window.open(BLOCKLIST_REPORT_URL, "_blank")}
      />
    </div>
  );
}
