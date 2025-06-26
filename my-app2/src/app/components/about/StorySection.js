/**
 * Story Section Component
 * Displays the project origin story using the StoryCard component
 * Separates the story content logic from the main About page
 */

import { StoryCard } from './Card';
import { aboutContent } from './aboutContent';

export default function StorySection() {
  const { story } = aboutContent;

  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <StoryCard 
          title={story.title}
          paragraphs={story.paragraphs}
        />
      </div>
    </section>
  );
} 