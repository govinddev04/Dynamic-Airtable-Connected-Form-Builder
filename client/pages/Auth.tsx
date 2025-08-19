import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, Database, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we're handling a callback
  useEffect(() => {
    const token = searchParams.get('token');
    const errorMessage = searchParams.get('message');

    if (token) {
      handleCallback(token);
    } else if (errorMessage) {
      setError(errorMessage);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleCallback = async (token: string) => {
    try {
      setIsLoading(true);
      await login(token);
      navigate('/dashboard');
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAirtableLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/airtable');
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Airtable OAuth
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      setError('Failed to initiate Airtable authentication. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FormInput className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FormFlow</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Auth Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Connect to Airtable</CardTitle>
            <CardDescription>
              Sign in with your Airtable account to start building dynamic forms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleAirtableLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Database className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Connecting...' : 'Continue with Airtable'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                🔒 Your data is secure and encrypted
              </p>
              <p className="text-xs text-gray-500 mt-1">
                We only access the bases and tables you give us permission to
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
