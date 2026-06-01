import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-billing",
  templateUrl: "./billing.component.html",
  styleUrls: ["./billing.component.css"],
})
export class BillingComponent implements OnInit {
  invoices: any[] = [];
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  async loadInvoices() {
    try {
      this.loading = true;
      this.invoices = (await this.api.get("/admin_contactRequest/invoices")) as any[];
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      this.loading = false;
    }
  }
}
