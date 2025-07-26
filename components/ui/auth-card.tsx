"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

interface AuthCardFooterProps {
  text: string;
  linkText: string;
  href: string;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  className = "w-[350px]",
}: AuthCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardContent>{footer}</CardContent>}
    </Card>
  );
}

export function AuthCardFooter({ text, linkText, href }: AuthCardFooterProps) {
  return (
    <div className="text-center text-sm">
      <span className="text-gray-600">{text} </span>
      <Link href={href} className="text-blue-600 hover:text-blue-800 font-medium">
        {linkText}
      </Link>
    </div>
  );
}

export function AuthCardButton({ children, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button className="w-full" {...props}>
      {children}
    </Button>
  );
} 