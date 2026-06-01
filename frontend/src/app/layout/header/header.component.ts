import { Component, Output, EventEmitter } from "@angular/core";
import { MenuItem } from "primeng/api";
import { Router } from '@angular/router';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent {
  @Output() toggleMenu = new EventEmitter<void>();

  constructor(private router: Router) {}

  userMenuItems: MenuItem[] = [
    {
      label: "Logout",
      icon: "pi pi-sign-out",
      command: () => {
        this.logout();
      },
    },
  ];

  onToggleMenu() {
    this.toggleMenu.emit();
  }

  logout() {
    // TODO: Implement logout functionality
    console.log("Logout clicked");
    this.router.navigate(['/login']);
  }
}
