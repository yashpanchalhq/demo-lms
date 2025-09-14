import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  Shield,
  Smartphone,
  BarChart3,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Teacher Training LMS
              </span>
            </div>
            <div className="flex space-x-4">
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Teacher Training
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your professional development with our comprehensive
            Learning Management System designed specifically for teacher
            training programs.
          </p>

          {/* Demo Features */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 max-w-3xl mx-auto">
            <p className="text-green-800 font-medium text-center mb-3">
              🎆 <strong>Full Demo Ready!</strong> Experience all key LMS
              features:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-green-700">
                <span>•</span> <strong>Admin:</strong> Upload modules, assign
                courses, track completions
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span>•</span> <strong>Teacher:</strong> View schedule, take
                quizzes, earn certificates
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span>•</span> <strong>Interactive:</strong> Real quiz system
                with auto-certificates
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <span>•</span> <strong>Complete:</strong> Full workflow from
                upload to certification
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                View Admin Demo
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">
                Try Authentication
              </Button>
            </Link>
          </div>

          <div className="flex justify-center gap-6 mt-4">
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Admin Dashboard →
            </Link>
            <Link
              href="/"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Teacher Dashboard →
            </Link>
            <Link
              href="/sign-in"
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Authentication →
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Built for Modern Education
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to manage teacher training programs effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Manage 100+ teachers and 5 admin users with role-based access
                control and permissions.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create, organize, and deliver training content with videos,
                documents, and interactive quizzes.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Real-time analytics and completion tracking with detailed
                progress reports for administrators.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-10 w-10 text-yellow-600 mb-4" />
              <CardTitle>Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automated certificate generation and management for completed
                training programs.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-10 w-10 text-red-600 mb-4" />
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Enterprise-grade security with authentication, authorization,
                and data encryption.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Smartphone className="h-10 w-10 text-indigo-600 mb-4" />
              <CardTitle>Mobile Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Fully responsive design that works seamlessly on desktop,
                tablet, and mobile devices.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quick Setup Guide
            </h2>
            <p className="text-xl text-gray-600">
              Get your LMS running in under 10 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Setup Supabase</h3>
              <p className="text-gray-600">
                Create a free Supabase project and get your API keys
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Configure Environment
              </h3>
              <p className="text-gray-600">
                Add your Supabase credentials to .env.local file
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Launch & Demo</h3>
              <p className="text-gray-600">
                Run the development server and create your first users
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/sign-up">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Demo Setup
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GraduationCap className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Teacher Training LMS</span>
            </div>
            <p className="text-gray-400 mb-8">
              Empowering educators through modern technology and comprehensive
              training programs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-semibold mb-4">Tech Stack</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Next.js 14 + TypeScript</li>
                  <li>Supabase Database</li>
                  <li>Shadcn/ui + Tailwind CSS v4</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Role-based Access Control</li>
                  <li>Real-time Progress Tracking</li>
                  <li>Automated Certificates</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Complete Documentation</li>
                  <li>Setup Guides</li>
                  <li>Production Ready</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
