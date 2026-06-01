import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-shell",
  templateUrl: "./shell.component.html",
  styleUrls: ["./shell.component.css"],
})
export class ShellComponent implements OnInit {
  showMenu = true;
  isMenuCollapsed = false;

  constructor(private router: Router) {
    this.updateMenuVisibility(this.router.url);

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects || this.router.url;
        this.updateMenuVisibility(url);
      });
  }

  ngOnInit(): void {
    // Collapse menu by default on small screens
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      this.isMenuCollapsed = true;
    }
  }

  private updateMenuVisibility(url: string) {
    const hideOn = ["/login", "/signup"];
    this.showMenu = !hideOn.some((path) => url.startsWith(path));
  }

  toggleMenuCollapse() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }
}
