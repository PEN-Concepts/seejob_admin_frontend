import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { LoginComponent } from "./modules/login/login.component";
import { MembersComponent } from "./modules/members/members.component";
import { DashboardComponent } from "./modules/dashboard/dashboard.component";
import { BillingComponent } from "./modules/billing/billing.component";
import { AnalyticsComponent } from "./modules/analytics/analytics.component";
import { SupportComponent } from "./modules/support/support.component";
import { TicketDetailComponent } from "./modules/support/ticket-detail/ticket-detail.component";
import { DemoRequestComponent } from "./modules/demo-request/demo-request.component";
import { ContactRequestComponent } from "./modules/contact-request/contact-request.component";
import { RevenueDashboardComponent } from "./modules/revenue-dashboard/revenue-dashboard.component";
import { AdminUsersComponent } from "./modules/admin-users/admin-users.component";

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "members", component: MembersComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "billing", component: BillingComponent },
  { path: "analytics", component: AnalyticsComponent },
  { path: "support", component: SupportComponent },
  { path: "support/ticket/new", component: TicketDetailComponent },
  { path: "support/ticket/:id", component: TicketDetailComponent },
  { path: "support/ticket/:id/:mode", component: TicketDetailComponent },
  { path: "contact-request", component: ContactRequestComponent },
  { path: "demo-request", component: DemoRequestComponent },
  { path: "revenue-dashboard", component: RevenueDashboardComponent },
  { path: "admin-users", component: AdminUsersComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
})
export class AppRoutingModule {}
