import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// Define a type for recent transactions based on usage
export interface RecentTransaction {
  // Add only the fields used in the component
  [key: string]: unknown;
}

interface RecentTransactionsTableProps {
  recentTransactions: RecentTransaction[];
}

// If you receive recentTransactions as unknown[], cast it:
// const safeTransactions = recentTransactions as RecentTransaction[];

export function RecentTransactionsTable({ recentTransactions }: RecentTransactionsTableProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Recent Transactions</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Partner</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentTransactions.map((tx) => {
            const t = tx as { id: string; month?: string; entityName?: string; amount: string | number };
            return (
              <TableRow key={t.id}>
                <TableCell>{t.month ? t.month.slice(0, 10) : ''}</TableCell>
                <TableCell>{t.entityName ?? ''}</TableCell>
                <TableCell className="text-right">₹{parseFloat(String(t.amount)).toLocaleString('en-IN')}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 