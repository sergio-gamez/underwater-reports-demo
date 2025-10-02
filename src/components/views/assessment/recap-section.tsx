"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface RecapSectionProps {
  value: string;
  onChange: (value: string) => void;
  isNewAssessment: boolean;
}

export function RecapSection({ value, onChange, isNewAssessment }: RecapSectionProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recap</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex">
        <Textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          placeholder={isNewAssessment ? "Enter your charter party recap here..." : ""}
          className="resize-none flex-1 min-h-[400px]"
        />
      </CardContent>
    </Card>
  );
} 