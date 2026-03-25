import { FileText, ShieldCheck, Upload, Users } from "lucide-react";
import React from "react";
import { AuthButton } from "../components/auth";

const features = [
  {
    icon: Users,
    title: "Employee Management",
    desc: "Manage all employee records in one centralized platform",
  },
  {
    icon: Upload,
    title: "Document Upload",
    desc: "Securely upload and store all required employee documents",
  },
  {
    icon: ShieldCheck,
    title: "Verification Tracking",
    desc: "Track document completion and verification status",
  },
];

export function LoginPage() {
  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.19 0.042 235) 0%, oklch(0.25 0.042 235) 50%, oklch(0.30 0.06 240) 100%)",
      }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Infinexy Doc
          </span>
        </div>
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold leading-tight mb-3">
              Manage Employee Documents <br />
              <span className="text-primary/80">Effortlessly</span>
            </h1>
            <p className="text-white/60 text-lg">
              A professional document management system for modern HR teams.
            </p>
          </div>
          <div className="space-y-5">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-white/60">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-sm">
          &copy; {new Date().getFullYear()} Infinexy Doc. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline hover:text-white/60 transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8"
            data-ocid="login.card"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                <FileText className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Welcome Back
              </h2>
              <p className="text-muted-foreground mt-1">
                Sign in to access Infinexy Doc
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground text-center">
                Use Internet Identity to securely authenticate your account.
              </div>
              <div className="flex justify-center">
                <AuthButton />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-6">
              Secure authentication powered by Internet Identity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
