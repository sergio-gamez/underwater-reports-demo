"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Multi-tenant authentication configuration
const VALID_CREDENTIALS = {
  'ldc': 'genevaairport',
  'admin': 'adminpass'
};

const USER_TENANTS = {
  'ldc': 'ldc',
  'admin': 'admin'
} as const;

const TENANT_ASSESSMENTS = {
  'ldc': [
    'photo_inspection_mv_crystalya',
    'cleaning_report_mv_crystalya'
  ],
  'admin': [
    'photo_inspection_mv_crystalya',
    'cleaning_report_mv_crystalya'
  ]
} as const;

export type TenantId = keyof typeof USER_TENANTS;

export function getTenantAssessments(tenantId: TenantId): readonly string[] {
  return TENANT_ASSESSMENTS[tenantId] || [];
}

export function canTenantAccessAssessment(tenantId: TenantId, assessmentId: string): boolean {
  return getTenantAssessments(tenantId).includes(assessmentId);
}

export function getUserTenant(username: string): TenantId | null {
  if (username in USER_TENANTS) {
    return username as TenantId;
  }
  return null;
}

interface LoginFormProps {
  onLogin: (username: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (VALID_CREDENTIALS[username as keyof typeof VALID_CREDENTIALS] === password) {
      toast.success("Welcome back!");
      onLogin(username);
    } else {
      toast.error("Invalid username or password");
      setPassword("");
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Underwater Reports</CardTitle>
        <CardDescription>
          Underwater Cleaning & Inspection Analysis
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </form>
      {/* <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
        <p>Demo credentials:</p>
        <code className="text-xs bg-muted px-2 py-1 rounded">
          admin / password
        </code>
      </CardFooter> */}
    </Card>
  );
} 