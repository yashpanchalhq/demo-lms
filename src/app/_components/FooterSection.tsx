import { GraduationCap } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-10 w-10 text-blue-400" />
            <span className="text-xl font-bold">Teacher Training LMS</span>
          </div>
          <p className="text-gray-400 mb-8">
            Empowering educators through modern technology and comprehensive
            training programs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-semibold mb-4">Tech Stack</h4>
              <ul className="space-y-2 text-gray-400 text-base">
                <li>Next.js 14 + TypeScript</li>
                <li>Supabase Database</li>
                <li>Shadcn/ui + Tailwind CSS v4</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400 text-base">
                <li>Role-based Access Control</li>
                <li>Real-time Progress Tracking</li>
                <li>Automated Certificates</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-base">
                <li>Complete Documentation</li>
                <li>Setup Guides</li>
                <li>Production Ready</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
