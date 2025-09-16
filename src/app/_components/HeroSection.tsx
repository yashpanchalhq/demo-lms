import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function HeroSection() {
  return (
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 max-w-3xl mx-auto shadow-md">
          <p className="text-green-800 font-semibold text-center mb-3 text-lg">
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
              href="/teacher"
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
  );
}
