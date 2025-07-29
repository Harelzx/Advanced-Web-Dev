"use client";

import TeamSection from '../components/about/TeamSection';
import StorySection from '../components/about/StorySection';
import ArchitectureSection from '../components/about/ArchitectureSection';
import HeroSection from '../components/about/HeroSection';
import BackButton from '../components/about/BackButton';
import { aboutContent } from '../components/about/aboutContent';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-color)', color: 'var(--text-color)' }}>
      
      {/* Back to Home Button */}
      <BackButton 
        href={aboutContent.navigation.backToHome.href}
        text={aboutContent.navigation.backToHome.text}
      />
      
      {/* Hero Section */}
      <HeroSection 
        title={aboutContent.hero.title}
        subtitle={aboutContent.hero.subtitle}
      />

      {/* Story Section */}
      <StorySection />

      {/* Architecture Section */}
      <ArchitectureSection />

      {/* Team Section */}
      <TeamSection />

    </div>
  );
} 