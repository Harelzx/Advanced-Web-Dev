"use client";

import Header from "./components/Header";
import TeamSection from "./components/about/TeamSection";

export default function HomePage() {
  return (
    <div className="min-h-screen panels">
      <Header />
      
      <main className="py-2 md:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Team Section */}
          <TeamSection />
        </div>
      </main>
    </div>
  );
}