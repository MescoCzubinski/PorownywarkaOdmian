import { cn } from "@/utils/utils";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase select-none group-has-disabled/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
