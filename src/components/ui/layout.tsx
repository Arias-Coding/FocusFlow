import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  padding?: string;
}

export function PageLayout({
  children,
  className,
  maxWidth = "max-w-7xl",
  padding = "p-4 lg:p-8",
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center",
        padding,
        className
      )}
    >
      <div className={cn("w-full", maxWidth)}>{children}</div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8",
        className
      )}
    >
      <div className="space-y-2">
        {Icon && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
            <Icon className="h-3 w-3 fill-current" />
            {subtitle}
          </div>
        )}
        <h1 className="text-4xl lg:text-5xl font-black tracking-tighter">
          {title}
        </h1>
        {subtitle && !Icon && (
          <p className="text-muted-foreground font-medium italic">{subtitle}</p>
        )}
      </div>

      {actions && <div className="flex items-center gap-4">{actions}</div>}
    </div>
  );
}

interface CardGridProps {
  children: ReactNode;
  columns?: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  gap?: string;
  className?: string;
}

export function CardGrid({
  children,
  columns = {
    default: "grid-cols-1",
    md: "md:grid-cols-2",
    lg: "lg:grid-cols-3",
  },
  gap = "gap-6",
  className,
}: CardGridProps) {
  const gridClasses = Object.entries(columns)
    .map(([breakpoint, cols]) => (breakpoint === "default" ? cols : `${cols}`))
    .join(" ");

  return (
    <div className={cn("grid", gridClasses, gap, className)}>{children}</div>
  );
}
