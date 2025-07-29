
 /* Reusable Card Component for About Page */


export default function Card({ 
  children, 
  className = "", 
  style = {} 
}) {
  return (
    <div 
      className={`rounded-2xl p-4 sm:p-6 shadow-lg border ${className}`}
      style={{ 
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--input-border)',
        ...style
      }}
    >
      {children}
    </div>
  );
}

/**
 * Architecture Feature Card - Specialized card for architecture section
 * Props:
 * - icon: Emoji icon to display
 * - title: Card title
 * - features: Array of feature strings
 */
export function ArchitectureCard({ icon, title, features, className = '' }) {
  return (
    <Card className={className}>
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center">{icon}</div>
      <h3 
        className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-center" 
        style={{ color: 'var(--text-color)' }}
      >
        {title}
      </h3>
      <ul 
        className="space-y-1 sm:space-y-2 text-sm sm:text-base text-center opacity-70" 
        style={{ color: 'var(--text-color)' }}
      >
        {features.map((feature, index) => (
          <li key={index} className="leading-relaxed">{feature}</li>
        ))}
      </ul>
    </Card>
  );
}

/**
 * Story Card - Specialized card for story content
 * Props:
 * - title: Story section title
 * - paragraphs: Array of paragraph strings
 */
export function StoryCard({ title, paragraphs }) {
  return (
    <Card className="mb-4 sm:mb-6">
      <h2 
        className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-center px-2" 
        style={{ color: 'var(--text-color)' }}
      >
        {title}
      </h2>
      <div 
        className="max-w-4xl mx-auto px-2 sm:px-4" 
        style={{ 
          color: 'var(--text-color)', 
          direction: 'rtl'
        }}
      >
        {paragraphs.map((paragraph, index) => (
          <p 
            key={index}
            className={`text-base sm:text-lg leading-relaxed text-justify ${index < paragraphs.length - 1 ? 'mb-2 sm:mb-3' : ''}`}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </Card>
  );
} 