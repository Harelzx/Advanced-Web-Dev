/**
 * Architecture Section Component
 * Displays the project architecture information using reusable cards
 */

import { ArchitectureCard } from './Card';
import { aboutContent } from './aboutContent';

export default function ArchitectureSection() {
  const { architecture } = aboutContent;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 
          className="text-3xl font-bold text-center mb-8" 
          style={{ color: 'var(--text-color)' }}
        >
          {architecture.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {architecture.cards.map((card) => (
            <ArchitectureCard
              key={card.id}
              icon={card.icon}
              title={card.title}
              features={card.features}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 