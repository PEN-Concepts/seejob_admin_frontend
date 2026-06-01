import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  rightKeys?: string[];
}

@Component({
  selector: "app-left-menu",
  templateUrl: "./left-menu.component.html",
  styleUrls: ["./left-menu.component.css"],
})
export class LeftMenuComponent implements OnInit {
  @Input() isCollapsed = false;
  @Output() closeMenu = new EventEmitter<void>();
  visibleMenuItems: MenuItem[] = [];

  menuItems: MenuItem[] = [
    {
      label: "Dashboard",
      icon: "pi pi-th-large",
      route: "/dashboard",
      rightKeys: ["dashboard"],
    },
    {
      label: "Revenue Dashboard",
      icon: "pi pi-wallet",
      route: "/revenue-dashboard",
      rightKeys: ["revenue_dashboard", "revenue-dashboard"],
    },
    {
      label: "Members",
      icon: "pi pi-users",
      route: "/members",
      rightKeys: ["members", "member"],
    },
    {
      label: "Billing",
      icon: "pi pi-credit-card",
      route: "/billing",
      rightKeys: ["billing"],
    },
    {
      label: "Analytics",
      icon: "pi pi-chart-line",
      route: "/analytics",
      rightKeys: ["analytics"],
    },
    {
      label: "Support",
      icon: "pi pi-question-circle",
      route: "/support",
      rightKeys: ["support"],
    },
    {
      label: "Contact Request",
      icon: "pi pi-question-circle",
      route: "/contact-request",
      rightKeys: ["contact_request", "contact-request"],
    },
    {
      label: "Demo Request",
      icon: "pi pi-question-circle",
      route: "/demo-request",
      rightKeys: ["demo_request", "demo-request"],
    },
    {
      label: "Admin Users",
      icon: "pi pi-users",
      route: "/admin-users",
      rightKeys: ["admin-users"],
    },
  ];

  constructor(private api: ApiService) {}

  async ngOnInit(): Promise<void> {
    await this.applyMenuPermissions();
  }

  onCloseClick() {
    this.closeMenu.emit();
  }

  private async applyMenuPermissions() {
    const user = this.getUserFromStorage();
    const userRights = Array.isArray(user?.rights) ? user.rights : [];

    // Requirement: when no rights are assigned, show all menu items.
    if (!userRights.length) {
      this.visibleMenuItems = [...this.menuItems];
      return;
    }

    try {
      const rightsRes: any = await this.api.get("admin_contactRequest/rights");
      const rightsMaster = Array.isArray(rightsRes) ? rightsRes : rightsRes?.data || [];
      const rightsById = new Map<number, string>();
      rightsMaster.forEach((r: any) => {
        rightsById.set(Number(r.id), String(r.name || "").toLowerCase());
      });

      const allowedNames = new Set<string>();
      userRights.forEach((r: any) => {
        const rightName = rightsById.get(Number(r.right_id));
        if (rightName) this.addRightNameVariants(allowedNames, rightName);
        this.addRightNameVariants(allowedNames, r.name);
        this.addRightNameVariants(allowedNames, r.display_name);
      });

      this.visibleMenuItems = this.menuItems.filter((item) => {
        if (!item.rightKeys?.length) return true;
        return item.rightKeys.some((key) =>
          allowedNames.has(this.normalizeRightName(key))
        );
      });

      // Safety fallback: never leave menu completely empty.
      if (!this.visibleMenuItems.length) {
        this.visibleMenuItems = [...this.menuItems];
      }
    } catch (error) {
      this.visibleMenuItems = [...this.menuItems];
    }
  }

  private getUserFromStorage(): any {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private addRightNameVariants(names: Set<string>, value: any) {
    const normalized = this.normalizeRightName(value);
    if (!normalized) return;

    names.add(normalized);
    names.add(normalized.replace(/_/g, "-"));
    names.add(normalized.replace(/-/g, "_"));
  }

  private normalizeRightName(value: any): string {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
  }
}
