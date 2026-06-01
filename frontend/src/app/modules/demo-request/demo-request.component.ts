import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-demo-request",
    templateUrl: './demo-request.component.html',
  styleUrl: './demo-request.component.css'
})

export class DemoRequestComponent implements OnInit {
 demoRequest: any[] = [];
  loading = false;
  constructor(
    private api: ApiService
  ) {}

  async ngOnInit() {
    await this.loadMembers();
  }
 async loadMembers() {
  try {
    this.loading = true;

    const res: any = await this.api.get("admin_contactRequest/demo_request_list");

    this.demoRequest = res.data || [];  // ✅ FIX HERE

  } catch (error) {
    // error handled silently
  } finally {
    this.loading = false;
  }
}
}
