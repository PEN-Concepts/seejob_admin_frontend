import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  stats: any = {};
  members: any[] = [];
  filteredMembers: any[] = [];
  selectedContractor: string = "contractor";
  selectedFilter: string = "all";

  contractorOptions = [
    { label: "Contractor", value: "contractor" },
    { label: "All", value: "all" },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadMembers();
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.members];

    if (this.selectedFilter !== "all") {
      filtered = filtered.filter((member) => {
        const status =
          member.status === 1 || member.status === "active"
            ? "active"
            : member.status === 0 || member.status === "inactive"
            ? "inactive"
            : "pending";
        return status === this.selectedFilter;
      });
    }

    this.filteredMembers = filtered;
  }
  async loadStats() {
    try {
      this.stats = await this.api.get("/api/dashboard/summary");
    } catch (e) {
      console.error(e);
    }
  }
  async loadMembers() {
    try {
      this.members = (await this.api.get("/api/members")) as any[];
      this.filteredMembers = [...this.members];
    } catch (e) {
      console.error(e);
    }
  }
}
