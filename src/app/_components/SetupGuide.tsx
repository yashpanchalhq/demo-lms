import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SetupGuide() {
  return (
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
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-3xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Setup Supabase</h3>
            <p className="text-gray-600">
              Create a free Supabase project and get your API keys
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-3xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-bold mb-2">
              Configure Environment
            </h3>
            <p className="text-gray-600">
              Add your Supabase credentials to .env.local file
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-3xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Launch & Demo</h3>
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
  );
}
