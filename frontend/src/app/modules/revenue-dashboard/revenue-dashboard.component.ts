import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-revenue-dashboard",
  templateUrl: "./revenue-dashboard.component.html",
  styleUrls: ["./revenue-dashboard.component.css"],
})
export class RevenueDashboardComponent implements OnInit {
  stats = [
    { title: "Total Revenue", value: "$169K", sub: "▲ 12% from Last Month", trend: "up", icon: "pi pi-dollar" },
    { title: "Net Profit", value: "$95K", sub: "▲ 8% from Last Month", trend: "up", icon: "pi pi-chart-line" },
    { title: "Total Invoices", value: "1,352", sub: "▲ 3.5% from Last Month", trend: "up", icon: "pi pi-file" },
    { title: "Unpaid Invoices", value: "$64K", sub: "▼ 5% from Last Month", trend: "down", icon: "pi pi-exclamation-circle" },
  ];

  revenueChartData: any;
  revenueChartOptions: any;

  invoices: any[] = [];
  loading = false;

  selectedPeriod: string = "last6months";
  periodOptions = [
    { label: "Last 6 Months", value: "last6months" },
    { label: "Last 12 Months", value: "last12months" },
    { label: "This Year", value: "thisyear" },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.initChart();
    this.loadInvoices();
  }

  initChart() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

    this.revenueChartData = {
      labels: months,
      datasets: [
        {
          label: "Revenue",
          data: [8200, 9100, 10500, 9800, 11200, 11177, 10800, 12400],
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#22c55e",
        },
        {
          label: "Net Profit",
          data: [6500, 7200, 8100, 7600, 8900, 9050, 8700, 9800],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#3b82f6",
        },
        {
          label: "Costs",
          data: [1700, 1900, 2400, 2200, 2300, 2127, 2100, 2600],
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#ef4444",
        },
      ],
    };

    this.revenueChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            pointStyle: "rectRounded",
            padding: 20,
            font: { size: 12, family: "'Inter', sans-serif" },
          },
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#1e293b",
          titleFont: { size: 13 },
          bodyFont: { size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (context: any) {
              return context.dataset.label + ": $" + context.parsed.y.toLocaleString();
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 }, color: "#94a3b8" },
        },
        y: {
          grid: { color: "#f1f5f9" },
          ticks: {
            font: { size: 12 },
            color: "#94a3b8",
            callback: function (value: any) {
              return "$" + (value / 1000).toFixed(0) + "K";
            },
          },
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
    };
  }

  async loadInvoices() {
    this.loading = true;
    try {
      // Placeholder data — replace with API call when endpoint is ready
      // const data = await this.api.get("revenue/invoices");
      this.invoices = [
        { company: "BlueHorizon Ltd.", initials: "B", color: "#ef4444", issueDate: "08/17/25", contact: "accounts@bluehorizonltd.com", value: 2100, status: "paid" },
        { company: "NexaCorp", initials: "N", color: "#8b5cf6", issueDate: "08/17/25", contact: "payments@nexacorp.com", value: 1100, status: "unpaid" },
        { company: "StarFreight Co.", initials: "S", color: "#3b82f6", issueDate: "08/16/25", contact: "info@starfreight.com", value: 1500, status: "paid" },
        { company: "Movers", initials: "M", color: "#f59e0b", issueDate: "08/16/25", contact: "invoices@movers.com", value: 1030, status: "paid" },
        { company: "Arvox Solutions", initials: "A", color: "#64748b", issueDate: "08/16/25", contact: "payments@arvox.com", value: 2800, status: "recent" },
        { company: "Keystone Transport", initials: "K", color: "#06b6d4", issueDate: "08/16/25", contact: "invoices@keystonetr.com", value: 1200, status: "unpaid" },
        { company: "Kestrel Freight", initials: "K", color: "#1e293b", issueDate: "08/16/25", contact: "info@kestrel.com", value: 1400, status: "paid" },
        { company: "SwiftLogix", initials: "S", color: "#22c55e", issueDate: "08/15/25", contact: "accounts@swiftlogix.com", value: 1600, status: "paid" },
        { company: "GlobalTrade Inc.", initials: "G", color: "#ec4899", issueDate: "08/15/25", contact: "accounts@globaltrade.com", value: 2300, status: "recent" },
        { company: "PathBlaze Inc.", initials: "P", color: "#6366f1", issueDate: "08/15/25", contact: "invoices@pathblaze.com", value: 1510, status: "unpaid" },
      ];
    } catch (e) {
      console.error("Error loading invoices:", e);
    } finally {
      this.loading = false;
    }
  }

  getStatusSeverity(status: string): "success" | "warning" | "danger" | "info" {
    switch (status) {
      case "paid": return "success";
      case "unpaid": return "danger";
      case "recent": return "warning";
      default: return "info";
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case "paid": return "Paid";
      case "unpaid": return "Unpaid";
      case "recent": return "Recent Request";
      default: return status;
    }
  }
}
