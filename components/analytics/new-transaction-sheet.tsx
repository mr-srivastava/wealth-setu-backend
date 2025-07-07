"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { useEntities } from "@/lib/hooks/use-analytics";
import { Plus } from "lucide-react";
import type { Entity } from "@/components/analytics/types";

export function NewTransactionSheet() {
  const [open, setOpen] = useState(false);
  const [entityId, setEntityId] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const entitiesQuery = useEntities();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!entityId || !date || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please fill all fields with valid values.");
      return;
    }
    setLoading(true);
    try {
      // Format date as local YYYY-MM-DD string
      const pad = (n: number) => n.toString().padStart(2, "0");
      const localDateString = date
        ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        : "";
      const res = await fetch("/api/analytics/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId,
          month: localDateString,
          amount: Number(amount).toFixed(2),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create transaction");
      }
      setSuccess(true);
      setEntityId("");
      setDate(undefined);
      setAmount("");
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1000);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message?: unknown }).message === 'string'
      ) {
        setError((err as { message: string }).message || "Unknown error");
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Entity</label>
            <Select value={entityId} onValueChange={setEntityId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={entitiesQuery.isLoading ? "Loading..." : "Select entity"} />
              </SelectTrigger>
              <SelectContent>
                {entitiesQuery.data && Array.isArray(entitiesQuery.data) && entitiesQuery.data.length > 0 && (
                  entitiesQuery.data.map((entity: Entity) => (
                    <SelectItem key={entity.entity.id} value={entity.entity.id}>
                      {entity.entity.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <DatePicker date={date} onDateChange={setDate} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Transaction created!</div>}
          <DialogFooter className="flex flex-row gap-2 justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Transaction"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 