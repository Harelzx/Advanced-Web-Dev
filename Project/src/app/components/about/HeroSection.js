/**
 * Hero Section Component
 * Can be reused across different pages with different props
 */

export default function HeroSection({ 
  title, 
  subtitle = null, 
  showDivider = true, 
  dividerColor = "bg-indigo-600",
  titleSize = "text-4xl lg:text-5xl",
  containerMaxWidth = "max-w-4xl",
  spacing = "pt-4 pb-4"
}) {
  return (
    <section className={`${spacing} px-4 sm:px-6 lg:px-8`}>
      <div className={`${containerMaxWidth} mx-auto text-center`}>
        <h1 
          className={`${titleSize} font-bold mb-4`} 
          style={{ color: 'var(--text-color)' }}
        >
          {title}
        </h1>
        
        {subtitle && (
          <p 
            className="text-lg mb-4 opacity-80" 
            style={{ color: 'var(--text-color)' }}
          >
            {subtitle}
          </p>
        )}
        
        {showDivider && (
          <div className={`w-24 h-1 ${dividerColor} mx-auto rounded-full`}></div>
        )}
      </div>
    </section>
  );
} 