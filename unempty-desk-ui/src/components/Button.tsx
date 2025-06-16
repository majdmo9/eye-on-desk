import { cn } from "@unempty-desk-ui/utils/cn";

export function Button({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("bg-indigo-600 text-white hover:bg-indigo-700 font-medium rounded-lg", className)} {...props} />;
}
