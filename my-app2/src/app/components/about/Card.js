
 /* Reusable Card Component for About Page */


export default function Card({ 
  children, 
  className = "", 
  style = {} 
}) {
  return (
    <div 
      className={`rounded-2xl p-6 shadow-lg border ${className}`}
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
export function ArchitectureCard({ icon, title, features }) {
  return (
    <Card>
      <div className="text-4xl mb-4 text-center">{icon}</div>
      <h3 
        className="text-xl font-semibold mb-3 text-center" 
        style={{ color: 'var(--text-color)' }}
      >
        {title}
      </h3>
      <ul 
        className="space-y-2 text-center opacity-70" 
        style={{ color: 'var(--text-color)' }}
      >
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
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
    <Card className="mb-4">
      <h2 
        className="text-3xl font-bold mb-6 text-center" 
        style={{ color: 'var(--text-color)' }}
      >
        {title}
      </h2>
      <div 
        className="max-w-4xl mx-auto" 
        style={{ 
          color: 'var(--text-color)', 
          direction: 'rtl'
        }}
      >
        {paragraphs.map((paragraph, index) => (
          <p 
            key={index}
            className={`text-lg leading-relaxed text-justify ${index < paragraphs.length - 1 ? 'mb-4' : ''}`}
            style={{ lineHeight: '1.8' }}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </Card>
  );
} 