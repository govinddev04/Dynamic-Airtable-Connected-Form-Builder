import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, FormInput, Zap, Shield, Users, CheckCircle, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Database,
      title: "Airtable Integration",
      description: "Connect directly to your Airtable bases and tables with secure OAuth authentication."
    },
    {
      icon: FormInput,
      title: "Dynamic Form Builder",
      description: "Create custom forms using your Airtable fields with drag-and-drop simplicity."
    },
    {
      icon: Zap,
      title: "Conditional Logic",
      description: "Add smart conditional logic to show or hide fields based on user responses."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted data transmission and storage."
    }
  ];

  const supportedFields = [
    "Short Text", "Long Text", "Single Select", "Multi Select", "File Upload"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FormInput className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FormFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/forms/new">Create Form</Link>
                  </Button>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{user?.name}</span>
                  </div>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/demo">Demo</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">Sign In with Airtable</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              🚀 Now with Conditional Logic
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Build
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {" "}Dynamic Forms{" "}
            </span>
            from Your Airtable Data
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your Airtable bases into powerful, interactive forms with conditional logic. 
            Collect responses and save them directly back to Airtable automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {isAuthenticated ? (
              <>
                <Button size="lg" className="text-lg px-8 py-4" asChild>
                  <Link to="/forms/new">
                    Create Your First Form
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
                  <Link to="/dashboard">
                    View Dashboard
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-4" asChild>
                  <Link to="/auth">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-4" asChild>
                  <Link to="/demo">
                    View Demo
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Demo Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-white">
              <div className="bg-gray-100 px-6 py-4 border-b flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="ml-4 text-sm text-gray-600">FormFlow - Form Builder</div>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FormInput className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">Interactive Form Builder</h3>
                  <p className="text-gray-600">Connect your Airtable to see the magic happen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to build powerful forms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect, customize, and collect with our comprehensive form building platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Fields Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Supported Airtable Field Types
            </h2>
            <p className="text-xl text-gray-600">
              We support the most commonly used Airtable field types for maximum compatibility
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {supportedFields.map((field, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-base py-2 px-4 bg-white border-gray-300 hover:border-blue-500 transition-colors"
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {field}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to transform your Airtable data?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using FormFlow to create powerful, 
            data-driven forms in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4" asChild>
              <Link to="/auth">
                Start Building Forms
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <FormInput className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FormFlow</span>
            </div>
            <div className="text-sm text-gray-400">
              Built with Airtable API • Secure & Reliable
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
