import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Award,
  Shield,
  Smartphone,
  BarChart3,
} from "lucide-react";

export function FeaturesGrid() {
  return (
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
            <Users className="h-12 w-12 text-blue-600 mb-4" />
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
            <BookOpen className="h-12 w-12 text-green-600 mb-4" />
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
            <BarChart3 className="h-12 w-12 text-purple-600 mb-4" />
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
            <Award className="h-12 w-12 text-yellow-600 mb-4" />
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
            <Shield className="h-12 w-12 text-red-600 mb-4" />
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
            <Smartphone className="h-12 w-12 text-indigo-600 mb-4" />
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
  );
}
