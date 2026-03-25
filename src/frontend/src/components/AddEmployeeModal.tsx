import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddEmployee } from "../hooks/useQueries";

const DEPARTMENTS = [
  "Telecaller",
  "Back Office",
  "IT Developer",
  "HR (Human Resource)",
  "Managing Director",
  "Branch Manager",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEmployeeModal({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    department: "",
    email: "",
    phone: "",
    joinDate: "",
  });
  const { mutateAsync, isPending } = useAddEmployee();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const joinDateNs =
        BigInt(new Date(form.joinDate).getTime()) * BigInt(1_000_000);
      await mutateAsync({
        name: form.name,
        department: form.department,
        email: form.email,
        phone: form.phone,
        joinDate: joinDateNs,
      });
      toast.success(`Employee "${form.name}" added successfully!`);
      onOpenChange(false);
      setForm({
        name: "",
        employeeId: "",
        department: "",
        email: "",
        phone: "",
        joinDate: "",
      });
    } catch {
      toast.error("Failed to add employee. Please try again.");
    }
  };

  const set =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-ocid="add_employee.dialog">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="emp-name">Full Name *</Label>
              <Input
                id="emp-name"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Rahul Sharma"
                required
                data-ocid="add_employee.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-email">Email *</Label>
              <Input
                id="emp-email"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="rahul@company.com"
                required
                data-ocid="add_employee.email_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-phone">Phone *</Label>
              <Input
                id="emp-phone"
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+91 9876543210"
                required
                data-ocid="add_employee.phone_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Department *</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm((p) => ({ ...p, department: v }))}
                required
              >
                <SelectTrigger data-ocid="add_employee.department_select">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-join">Join Date *</Label>
              <Input
                id="emp-join"
                type="date"
                value={form.joinDate}
                onChange={set("joinDate")}
                required
                data-ocid="add_employee.join_date_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="add_employee.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.department}
              data-ocid="add_employee.submit_button"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isPending ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
