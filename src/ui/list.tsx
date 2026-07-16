import { cn } from "@/utils/utils";

function List({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="list"
      className={cn("flex list-none flex-col gap-3", className)}
      {...props}
    />
  );
}

function ListItem({
  className,
  children,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="list-item"
      className={cn("flex items-center gap-2.5", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current"
      />
      {children}
    </li>
  );
}

export { List, ListItem };
