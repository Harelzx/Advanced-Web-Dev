'use client';

import Image from 'next/image';

/**
 * Team Section Component
 * Can be reused across different pages with optional title/subtitle props
 */
export default function TeamSection({ showTitle = true, showSubtitle = true }) {
  const teamMembers = [
    {
      name: "Tanya Noritsin",
      role: "B.Sc. Info. Systems Engineering Student",
      linkedin: "https://www.linkedin.com/in/tanya-noritsin",
      image: "/team/tanya.jpeg"
    },
    {
      name: "Nir Gluck",
      role: "B.Sc. Info. Systems Engineering Student",
      linkedin: "https://www.linkedin.com/in/nirgluck/", 
      image: "/team/nir.jpeg"
    },
    {
      name: "Yakov Shulman",
      role: "SOC Analyst | Info. Systems Engineering Student", 
      linkedin: "https://linkedin.com/in/yakov-shulman",
      image: "/team/yakov.jpeg"
    },
    {
      name: "Dganit Vainer", 
      role: "B.Sc. Software Engineering Student",
      linkedin: "https://www.linkedin.com/in/dganit-vainer-89a131269/",
      image: "/team/dganit.jpeg"
    },
    {
      name: "Harel Aronovich",
      role: "B.Sc. Software Engineering Student",
      linkedin: "https://linkedin.com/in/harel-aronovich",
      image: "/team/harel.jpeg"
    }
  ];

  return (
    <section className="pt-2 pb-4 md:pt-2 md:pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {showTitle && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-gray-900 dark:text-gray-100">
            הצוות המפתח
          </h2>
        )}

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {teamMembers.slice(0, 2).map((member, index) => (
            <div 
              key={index} 
              className="panels rounded-xl p-3 md:p-5 shadow-md border text-center hover:shadow-lg transition-shadow duration-300 border-gray-200 dark:border-gray-700 flex-1 max-w-xs lg:flex-none lg:w-[280px]"
            >
              
              {/* Profile Image */}
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                {member.image ? (
                  <Image 
                    src={member.image} 
                    alt={member.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`text-white text-xl font-bold ${member.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                  {member.name.charAt(0)}
                </div>
              </div>

              {/* Name and Role */}
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-900 dark:text-gray-100">
                {member.name}
              </h3>
              <p className="text-xs md:text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3 md:mb-4 leading-relaxed">
                {member.role}
              </p>

              {/* LinkedIn Link */}
              <a 
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                LinkedIn
              </a>
            </div>
                      ))}
          
          {/* Third member - only visible on desktop in first row */}
          <div className="hidden lg:block">
            <div className="panels rounded-xl p-3 md:p-5 shadow-md border text-center hover:shadow-lg transition-shadow duration-300 border-gray-200 dark:border-gray-700 flex-1 max-w-xs lg:flex-none lg:w-[280px]">
              {/* Profile Image */}
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                {teamMembers[2].image ? (
                  <Image 
                    src={teamMembers[2].image} 
                    alt={teamMembers[2].name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`text-white text-xl font-bold ${teamMembers[2].image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                  {teamMembers[2].name.charAt(0)}
                </div>
              </div>

              {/* Name and Role */}
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-900 dark:text-gray-100">
                {teamMembers[2].name}
              </h3>
              <p className="text-xs md:text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3 md:mb-4 leading-relaxed">
                {teamMembers[2].role}
              </p>

              {/* LinkedIn Link */}
              <a 
                href={teamMembers[2].linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
          
          {/* Second row - mobile: 2 items, desktop: 2 items */}
          <div className="w-full flex justify-center gap-4 md:gap-6">
            {teamMembers.slice(2, 5).map((member, index) => (
              <div 
                key={member.name} 
                className={`panels rounded-xl p-3 md:p-5 shadow-md border text-center hover:shadow-lg transition-shadow duration-300 border-gray-200 dark:border-gray-700 flex-1 max-w-xs lg:flex-none lg:w-[280px] ${index === 0 ? 'lg:hidden' : ''} ${index === 2 ? 'hidden lg:block' : ''}`}
              >
                
                {/* Profile Image */}
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {member.image ? (
                    <Image 
                      src={member.image} 
                      alt={member.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`text-white text-xl font-bold ${member.image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                    {member.name.charAt(0)}
                  </div>
                </div>

                {/* Name and Role */}
                <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-900 dark:text-gray-100">
                  {member.name}
                </h3>
                <p className="text-xs md:text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3 md:mb-4 leading-relaxed">
                  {member.role}
                </p>

                {/* LinkedIn Link */}
                <a 
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
          
          {/* Third row - mobile only: 1 item centered */}
          <div className="w-full flex justify-center gap-4 md:gap-6 lg:hidden">
                         <div className="panels rounded-xl p-3 md:p-5 shadow-md border text-center hover:shadow-lg transition-shadow duration-300 border-gray-200 dark:border-gray-700 flex-1 max-w-xs">
              {/* Profile Image */}
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                {teamMembers[4].image ? (
                  <Image 
                    src={teamMembers[4].image} 
                    alt={teamMembers[4].name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`text-white text-xl font-bold ${teamMembers[4].image ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                  {teamMembers[4].name.charAt(0)}
                </div>
              </div>

              {/* Name and Role */}
              <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2 text-gray-900 dark:text-gray-100">
                {teamMembers[4].name}
              </h3>
              <p className="text-xs md:text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-3 md:mb-4 leading-relaxed">
                {teamMembers[4].role}
              </p>

              {/* LinkedIn Link */}
              <a 
                href={teamMembers[4].linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
} 