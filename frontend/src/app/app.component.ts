import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  template: `
    <ng-container *ngIf="isLoginPage; else shellLayout">
      <router-outlet></router-outlet>
    </ng-container>
    <ng-template #shellLayout>
      <app-shell></app-shell>
    </ng-template>
  `,
})
export class AppComponent {
  isLoginPage = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      const url = this.router.url;
      this.isLoginPage =
        url === "/login" ||
        url === "/#/" ||
        url === "#/" ||
        url.startsWith("/#/");
    });
  }
}
