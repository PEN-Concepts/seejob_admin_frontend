import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.css"],
})
export class MembersComponent implements OnInit {
  demoRequest: any[] = [];
  globalFilterFields = [
    "id",
    "name",
    "email",
    "mobile",
    "subscription_status",
    "package_name",
    "amount",
  ];
  loading = false;
  visibleEmpDialog = false;
  task_editmode = false;
  createPermission = true;
  editPermission = true;
  empForm: FormGroup;
  subcategories: Array<{ label: string; value: number }> = [];
  employment_type = [
    { label: "Full Time", value: "full_time" },
    { label: "Part Time", value: "part_time" },
    { label: "Contract", value: "contract" },
  ];
  leavesList = [
    { id: 1, leave_type: "Casual Leave" },
    { id: 2, leave_type: "Sick Leave" },
    { id: 3, leave_type: "Paid Leave" },
  ];
  rights: any[] = [];
  editingMemberId: number | null = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.empForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phoneNumber: [""],
      subcategory: [null, Validators.required],
      employment_type: [null, Validators.required],
      rate: [null, [Validators.required, Validators.min(0)]],
      leave_ids: [[]],
      rights: [[]],
    });
  }

  async ngOnInit() {
    await Promise.all([this.loadMembers(), this.loadRights(), this.loadSubcategories()]);
  }

  onGlobalFilter(table: any, event: Event) {
    const value = (event.target as HTMLInputElement).value || "";
    table.filterGlobal(value.trim(), "contains");
  }

   async loadMembers() {
  try {
    this.loading = true;

    const res: any = await this.api.get("admin_contactRequest/user_list");
    console.log('all membeers',res)

    this.demoRequest = res.data || [];  // ✅ FIX HERE

  } catch (error) {
    console.error("Error loading members:", error);
  } finally {
    this.loading = false;
  }
}

  async loadRights() {
    try {
      const res: any = await this.api.get("admin_contactRequest/rights");
      this.rights = Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      console.error("Error loading rights:", error);
      this.rights = [];
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Unable to load rights list",
      });
    }
  }

  async loadSubcategories(categoryId: number = 5) {
    try {
      const res: any = await this.api.get(`invitations/getsubcategory/${categoryId}`);
      if (res?.status === 200 && Array.isArray(res?.data)) {
        this.subcategories = res.data.map((subcategory: any) => ({
          label: subcategory.name,
          value: subcategory.id,
        }));
      } else {
        console.error("Unexpected subcategories response:", res);
        this.subcategories = [];
      }
    } catch (error) {
      console.error("Error loading subcategories:", error);
      this.subcategories = [];
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Unable to load subcategories",
      });
    }
  }

async onStatusChange(member: any) {
  try {
    const payload = {
      user_id: member.id,
      status: member.status,
    };

    await this.api.post("admin_contactRequest/update_user_status", payload);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'User status updated',
    });

  } catch (error) {
    console.error("Status update failed:", error);

    // ❗ revert toggle if API fails
    member.status = member.status === 1 ? 0 : 1;

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update status',
    });
  }
}

  async deleteMember(member: any) {
    try {
      
      await this.api.post("admin_contactRequest/delete_user", { user_id: member.id });
      this.demoRequest = this.demoRequest.filter((m) => m.id !== member.id);
      this.messageService.add({
        severity: "success",
        summary: "Success",
        detail: "User deleted",
      });
    } catch (error) {
      console.error("Delete user failed:", error);
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete user",
      });
    }
  }

  openEmployeeDialog(editMode = false, member: any = null) {
    this.task_editmode = editMode;
    this.visibleEmpDialog = true;
    if (editMode && member) {
      this.editingMemberId = Number(member.id);
      this.empForm.reset({
        name: member.name || "",
        email: member.email || "",
        phoneNumber: this.formatPhoneFromValue(member.mobile || ""),
        subcategory: member.subcategory ? Number(member.subcategory) : null,
        employment_type: member.employment_type || null,
        rate: member.rate ?? null,
        leave_ids: Array.isArray(member.leave_ids) ? member.leave_ids : [],
        rights: Array.isArray(member.rights)
          ? member.rights.map((r: any) => Number(r.right_id || r.id))
          : [],
      });
    } else {
      this.editingMemberId = null;
      this.empForm.reset({
        name: "",
        email: "",
        phoneNumber: "",
        subcategory: null,
        employment_type: null,
        rate: null,
        leave_ids: [],
        rights: [],
      });
    }
  }

  formatPhoneNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || "").replace(/\D/g, "").slice(0, 10);
    let formatted = digits;

    if (digits.length > 3 && digits.length <= 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 0) {
      formatted = `(${digits}`;
    }

    this.empForm.get("phoneNumber")?.setValue(formatted, { emitEvent: false });
  }

  async onempSubmit() {
    if (this.empForm.invalid) {
      this.empForm.markAllAsTouched();
      return;
    }

    const formValue = this.empForm.value;
    const createdBy = this.getCurrentUserId();
    const registerPayload = {
      name: formValue.name,
      email: formValue.email,
      mobile: this.normalizePhone(formValue.phoneNumber),
      pin_enabled: 1,
      category: 5,
      subcategory: formValue.subcategory,
      business_name: "",
      trade: "",
      employment_type: formValue.employment_type,
      rate: formValue.rate,
      leave_ids: Array.isArray(formValue.leave_ids) ? formValue.leave_ids : [],
      created_by: createdBy,
    };

    try {
      let userId: number | null = null;
      if (this.task_editmode && this.editingMemberId) {
        userId = this.editingMemberId;
        await this.api.post("user/update_user", {
          user_id: userId,
          ...registerPayload,
        });
      } else {
        const registerRes: any = await this.api.post("user/register", registerPayload);
        userId = registerRes?.data?.userId ? Number(registerRes.data.userId) : null;
      }

      if (userId) {
        // assign-rights API deletes previous rights and inserts new rights.
        await this.api.post("invitations/assign-rights", {
          role_id: formValue.subcategory,
          user_id: userId,
          right_ids: Array.isArray(formValue.rights) ? formValue.rights : [],
        });
      }

      this.messageService.add({
        severity: "success",
        summary: "Saved",
        detail: this.task_editmode
          ? "Employee updated successfully"
          : "Employee created successfully",
      });
      this.visibleEmpDialog = false;
      this.editingMemberId = null;
      await this.loadMembers();
    } catch (error) {
      console.error("Employee submit failed:", error);
      const apiMessage =
        (error as any)?.error?.message ||
        (error as any)?.message ||
        "Failed to save employee";
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: apiMessage,
      });
    }
  }

  private getCurrentUserId(): number {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return 0;
      const parsed = JSON.parse(rawUser);
      return Number(parsed?.id) || 0;
    } catch {
      return 0;
    }
  }

  private normalizePhone(phone: string): string {
    return (phone || "").replace(/\D/g, "");
  }

  private formatPhoneFromValue(phone: string): string {
    const digits = this.normalizePhone(phone).slice(0, 10);
    if (!digits) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
