import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./modules/login/login.component";
import { MembersComponent } from "./modules/members/members.component";
import { DashboardComponent } from "./modules/dashboard/dashboard.component";
import { BillingComponent } from "./modules/billing/billing.component";
import { AnalyticsComponent } from "./modules/analytics/analytics.component";
import { SupportComponent } from "./modules/support/support.component";
import { TicketDetailComponent } from "./modules/support/ticket-detail/ticket-detail.component";
import { FormsModule } from "@angular/forms";
import { LeftMenuComponent } from "./layout/left-menu/left-menu.component";
import { ShellComponent } from "./layout/shell/shell.component";
import { HeaderComponent } from "./layout/header/header.component";
import { AuthGuard } from "./guards/auth.guard";
import { AuthInterceptor } from "./guards/auth.interceptor";
import { DemoRequestComponent } from "./modules/demo-request/demo-request.component";
import { ContactRequestComponent } from "./modules/contact-request/contact-request.component";
import { RevenueDashboardComponent } from "./modules/revenue-dashboard/revenue-dashboard.component";
import { AdminUsersComponent } from "./modules/admin-users/admin-users.component";

// PrimeNG Modules
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { CardModule } from "primeng/card";
import { MenubarModule } from "primeng/menubar";
import { SidebarModule } from "primeng/sidebar";
import { PanelMenuModule } from "primeng/panelmenu";
import { ToolbarModule } from "primeng/toolbar";
import { MenuModule } from "primeng/menu";
import { AvatarModule } from "primeng/avatar";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { DropdownModule } from "primeng/dropdown";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { TabViewModule } from "primeng/tabview";
import { InputSwitchModule } from "primeng/inputswitch";
import { ToastModule } from "primeng/toast";
import { ChartModule } from "primeng/chart";
import { DialogModule } from "primeng/dialog";
import { MultiSelectModule } from "primeng/multiselect";
import { CheckboxModule } from "primeng/checkbox";
import { MessageService } from "primeng/api";
import { ReactiveFormsModule } from "@angular/forms";

/**
 * Root Angular module
 *
 * Declares the application's top-level components and registers core imports
 * (HTTP, routing, forms) as well as global guards and interceptors.
 */
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MembersComponent,
    DashboardComponent,
    BillingComponent,
    AnalyticsComponent,
    SupportComponent,
    TicketDetailComponent,
    LeftMenuComponent,
    ShellComponent,
    HeaderComponent,
    DemoRequestComponent,
    ContactRequestComponent,
    RevenueDashboardComponent,
    AdminUsersComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    // PrimeNG Modules
    ButtonModule,
    InputTextModule,
    TableModule,
    CardModule,
    MenubarModule,
    SidebarModule,
    PanelMenuModule,
    ToolbarModule,
    MenuModule,
    AvatarModule,
    OverlayPanelModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    TabViewModule,
    InputSwitchModule,
    ToastModule,
    DialogModule,
    MultiSelectModule,
    CheckboxModule,
    ReactiveFormsModule,
    ChartModule,
  ],
  providers: [
    // Route guard used to protect feature routes
    AuthGuard,
    MessageService,
    // Global HTTP interceptor that attaches authorization headers
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
