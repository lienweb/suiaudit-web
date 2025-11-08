import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function FeatureCard({
  title,
  icon,
  onClick,
}: Readonly<{
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="mb-1 text-base text-gray-600">{title}</h3>
          </div>
          <ChevronRightIcon className="text-muted-foreground h-3 w-3 text-gray-400" />
        </div>
      </div>
    </button>
  );
}
