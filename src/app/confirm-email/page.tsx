"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link. Please check your email for the correct link.');
      return;
    }

    // In the future, this would call the API to confirm the email
    // For now, just show a message
    setStatus('error');
    setMessage('Email confirmation is not available yet - database not connected.');
  }, [token]);

  return (
    <Card>
      <CardHeader className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <CardTitle>Confirming your email...</CardTitle>
            <CardDescription>Please wait while we verify your email address.</CardDescription>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-green-700">Email Confirmed!</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-red-700">Confirmation Failed</CardTitle>
            <CardDescription>{message}</CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="text-center">
        {status === 'success' && (
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        )}
        {status === 'error' && (
          <Link href="/">
            <Button variant="outline" className="w-full">Return Home</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function ConfirmEmail() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Suspense fallback={
          <Card>
            <CardHeader className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
          </Card>
        }>
          <ConfirmEmailContent />
        </Suspense>
      </div>
    </Layout>
  );
}
