import * as React from "react";

import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-slate-50 text-slate-500 dark:bg-slate-900", className)} {...props} />;
}

function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-slate-200 dark:divide-slate-800", className)} {...props} />;
}

function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("text-slate-700 dark:text-slate-200", className)} {...props} />;
}

function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide", className)} {...props} />
  );
}

function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
