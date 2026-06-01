import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-contact-request",
  templateUrl: './contact-request.component.html',
  styleUrl: './contact-request.component.css'
})
export class ContactRequestComponent implements OnInit {
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

    const res: any = await this.api.get("admin_contactRequest/contact_list");

    this.demoRequest = res.data || [];  // ✅ FIX HERE
  } catch (error) {
    // error handled silently
  } finally {
    this.loading = false;
  }
}
}
