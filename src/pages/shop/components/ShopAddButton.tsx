import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShopAddButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export default function ShopAddButton({
  label,
  onClick,
  className,
}: ShopAddButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-full bg-gradient-to-b from-[#9ccc65] to-[#689f38] px-6 text-sm font-bold text-white shadow-[0_4px_14px_rgba(104,159,56,0.45)] hover:from-[#8bc34a] hover:to-[#558b2f]",
        className
      )}
    >
      <Plus className="mr-1 h-4 w-4" />
      {label}
    </Button>
  );
}
