import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"],
})
export class AnalyticsComponent implements OnInit {
  metrics: any = {};
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  async loadMetrics() {
    try {
      this.loading = true;
      this.metrics = await this.api.get("admin_contactRequest/summary");
    } catch (error) {
      // error handled silently
    } finally {
      this.loading = false;
    }
  }

  getMetricsArray() {
    if (!this.metrics) return [];

    return Object.keys(this.metrics).map((key) => ({
      label: this.formatLabel(key),
      value: this.metrics[key],
    }));
  }

  private formatLabel(key: string): string {
    // Convert camelCase or snake_case to Title Case
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }
}
