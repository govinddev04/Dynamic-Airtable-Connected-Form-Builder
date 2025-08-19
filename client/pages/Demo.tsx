import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormInput, ArrowLeft, Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export default function Demo() {
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Play className="w-4 h-4 mr-1" />
            Interactive Demo
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            See FormFlow in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore how easy it is to create dynamic forms from your Airtable data
          </p>
        </div>

        {/* Demo Scenarios */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                Form Builder Demo
              </CardTitle>
              <CardDescription>
                See how to create a form from an Airtable base with conditional logic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-8 mb-4 text-center">
                <FormInput className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive form builder demo</p>
              </div>
              <Button className="w-full">Launch Builder Demo</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="w-5 h-5 mr-2 text-green-600" />
                Form Viewer Demo
              </CardTitle>
              <CardDescription>
                Experience filling out a form with conditional logic in action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-8 mb-4 text-center">
                <FormInput className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive form viewer demo</p>
              </div>
              <Button className="w-full" variant="outline">Launch Viewer Demo</Button>
            </CardContent>
          </Card>
        </div>

        {/* Demo Features */}
        <Card>
          <CardHeader>
            <CardTitle>What You'll See in the Demo</CardTitle>
            <CardDescription>
              These demos showcase the core features of FormFlow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FormInput className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Field Selection</h3>
                <p className="text-sm text-gray-600">Choose which Airtable fields to include in your form</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Conditional Logic</h3>
                <p className="text-sm text-gray-600">Set up rules to show/hide fields based on responses</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Preview</h3>
                <p className="text-sm text-gray-600">See your form updates instantly as you build</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
