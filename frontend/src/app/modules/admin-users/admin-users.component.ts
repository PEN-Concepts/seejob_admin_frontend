import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { MessageService } from "primeng/api";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  category: number;
  subcategory: number;
  subcategory_name: string;
  category_name: string;
  permissions: AdminPermission[] | string | null;
}

interface AdminPermission {
  right_id: number | null;
  role_id: number | null;
  read: string | null;
  create: string | null;
  update: string | null;
  delete: string | null;
}

@Component({
  selector: "admin-users",
  templateUrl: "./admin-users.component.html",
  styleUrl: "./admin-users.component.css",
})
export class AdminUsersComponent implements OnInit {
  adminUsers: AdminUser[] = [];
  selectedAdminUser: AdminUser | null = null;
  loading = false;
  saving = false;
  visibleEmpDialog = false;
  task_editmode = false;
  createPermission = true;
  editPermission = true;
  empForm: FormGroup;
  rights: any[] = [];
  editingMemberId: number | null = null;
  subcategories: Array<{ label: string; value: number }> = [];

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.empForm = this.fb.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      subcategory: [null, Validators.required],
      rights: [[]],
    });
  }
  async ngOnInit() {
    await Promise.all([
      this.loadAdminUsers(),
      this.loadRights(),
      this.loadSubcategories(),
    ]);
  }

  async loadAdminUsers() {
    try {
      this.loading = true;
      const res: any = await this.api.get("admin_contactRequest/admin_user_list");
      this.adminUsers = Array.isArray(res?.data) ? res.data : [];
    } catch (error) {
      this.adminUsers = [];
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: "Unable to load admin users",
      });
    } finally {
      this.loading = false;
    }
  }

  openEmployeeDialog(editMode = false, member: any = null) {
    this.task_editmode = editMode;
    this.visibleEmpDialog = true;
    this.selectedAdminUser = editMode ? member : null;

    if (editMode && member) {
      this.editingMemberId = Number(member.id);
      this.empForm.reset({
        name: member.name || "",
        email: member.email || "",
        subcategory: this.getSubcategoryValue(member),
        rights: this.getRightIdsFromMember(member),
      });
    } else {
      this.editingMemberId = null;
      this.selectedAdminUser = null;
      this.empForm.reset({
        name: "",
        email: "",
        subcategory: null,
        rights: [],
      });
    }
  }



  async loadRights() {
    try {
      const res: any = await this.api.get("admin_contactRequest/rights");
      this.rights = Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
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
        this.subcategories = [];
      }
    } catch (error) {
      this.subcategories = [];
      this.messageService.add({
        severity: "warn",
        summary: "Warning",
        detail: "Unable to load subcategories",
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
  private getSubcategoryValue(member: any): number | null {
    if (member.subcategory) return Number(member.subcategory);

    const subcategory = this.subcategories.find(
      (item) =>
        item.label.toLowerCase() ===
        String(member.subcategory_name || "").toLowerCase()
    );

    return subcategory?.value || null;
  }

  private getRightIdsFromMember(member: any): number[] {
    return this.getPermissions(member.permissions)
      .map((permission) => Number(permission.right_id))
      .filter((id) => Number.isFinite(id) && id > 0);
  }

  private getPermissions(permissions: AdminPermission[] | string | null): AdminPermission[] {
    if (Array.isArray(permissions)) return permissions;
    if (!permissions) return [];

    try {
      const parsed = JSON.parse(permissions);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async onempSubmit() {
    if (this.saving) return;

    if (this.empForm.invalid) {
      this.empForm.markAllAsTouched();
      return;
    }

    const formValue = this.empForm.value;
    const createdBy = this.getCurrentUserId();
    const registerPayload = {
      name: formValue.name,
      email: formValue.email,
      category: 5,
      subcategory: formValue.subcategory,
      created_by: createdBy,
    };

    try {
      this.saving = true;
      let userId: number | null = null;
      if (this.task_editmode && this.editingMemberId) {
        userId = this.editingMemberId;
        await this.api.post("admin_contactRequest/update_admin_user", {
          user_id: userId,
          ...registerPayload,
          right_ids: Array.isArray(formValue.rights) ? formValue.rights : [],
        });
      } else {
        const registerRes: any = await this.api.post(
          "admin_contactRequest/create_admin_user",
          {
            ...registerPayload,
            role: formValue.subcategory,
          }
        );

        if (registerRes?.success === false || String(registerRes?.code) === "409") {
          throw new Error(registerRes?.message || "Failed to create admin user");
        }

        userId = registerRes?.data?.id ? Number(registerRes.data.id) : null;
      }

      if (userId && !this.task_editmode) {
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
      await this.loadAdminUsers();
    } catch (error) {
      const apiMessage =
        (error as any)?.error?.message ||
        (error as any)?.message ||
        "Failed to save employee";
      this.messageService.add({
        severity: "error",
        summary: "Error",
        detail: apiMessage,
      });
    } finally {
      this.saving = false;
    }
  }
}
