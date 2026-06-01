import { Component, ElementRef, QueryList, ViewChildren } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";

@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  @ViewChildren("otpInput") otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  email = "";
  showOtp = false;
  otpDigits = ["", "", "", ""];
  loading = false;
  errorMessage = "";
  successMessage = "";

  get isOtpComplete(): boolean {
    return this.otpDigits.every((digit) => /^\d$/.test(digit));
  }

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  trackByOtpIndex(index: number): number {
    return index;
  }

  async login() {
    await this.requestOtp();
  }

  async requestOtp() {
    if (this.loading) return;

    const email = this.email.trim();
    if (!email) {
      this.errorMessage = "Email is required";
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const res: any = await this.auth.requestLoginOtp(email);
      if (String(res?.code) === "200") {
        this.email = email;
        this.showOtp = true;
        this.otpDigits = ["", "", "", ""];
        this.successMessage = res?.message || "OTP sent";
        setTimeout(() => this.focusOtpInput(0));
        return;
      }

      this.errorMessage = res?.message || "Unable to send OTP";
    } catch (error) {
      console.error("Login OTP request failed:", error);
      this.errorMessage = "Unable to send OTP";
    } finally {
      this.loading = false;
    }
  }

  async verifyOtp() {
    if (this.loading) return;

    const otp = this.otpDigits.join("");
    if (!this.isOtpComplete) {
      this.errorMessage = "Enter the 4 digit OTP";
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = "";
      this.successMessage = "";

      const loggedIn = await this.auth.verifyLoginOtp(this.email, otp);
      if (loggedIn) {
        this.router.navigate([this.auth.getDefaultRouteAfterLogin()]);
        return;
      }

      this.errorMessage = "Invalid or expired OTP.";
    } catch (error: any) {
      console.error("Login OTP verify failed:", error);
      this.errorMessage =
        error?.error?.message || error?.message || "Invalid or expired OTP.";
    } finally {
      this.loading = false;
    }
  }

  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, "").slice(-1);
    if (this.otpDigits[index] === digit) {
      return;
    }
    this.otpDigits[index] = digit;

    if (digit && index < this.otpDigits.length - 1) {
      setTimeout(() => this.focusOtpInput(index + 1));
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number) {
    if (event.key === "Backspace" && !this.otpDigits[index] && index > 0) {
      this.focusOtpInput(index - 1);
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    const pastedOtp = event.clipboardData?.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pastedOtp) return;

    event.preventDefault();
    const chars = pastedOtp.split("");
    this.otpDigits = [0, 1, 2, 3].map((i) => chars[i] ?? "");
    setTimeout(() => this.focusOtpInput(Math.min(pastedOtp.length, 3)));
  }

  backToEmail() {
    this.showOtp = false;
    this.otpDigits = ["", "", "", ""];
    this.errorMessage = "";
    this.successMessage = "";
  }

  private focusOtpInput(index: number) {
    this.otpInputs?.get(index)?.nativeElement.focus();
  }
}
