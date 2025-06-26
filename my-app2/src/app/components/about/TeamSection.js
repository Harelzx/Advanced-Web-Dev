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
      name: "Dganit Vainer", 
      role: "B.Sc. Software Engineering Student",
      linkedin: "https://www.linkedin.com/in/dganit-vainer-89a131269/",
      image: "/team/dganit.jpeg"
    },
    {
      name: "Yakov Shulman",
      role: "SOC Analyst | Info. Systems Engineering Student", 
      linkedin: "https://linkedin.com/in/yakov-shulman",
      image: "/team/yakov.jpeg"
    },
    {
      name: "Nir Gluck",
      role: "B.Sc. Info. Systems Engineering Student",
      linkedin: "https://www.linkedin.com/in/nirgluck/", 
      image: "/team/nir.jpeg"
    },
    {
      name: "Harel Aronovich",
      role: "B.Sc. Software Engineering Student",
      linkedin: "https://linkedin.com/in/harel-aronovich",
      image: "/team/harel.jpeg"
    },
    {
      name: "Eitan Suchatsky",
      role: "B.Sc. Software Engineering Student", 
      linkedin: "https://linkedin.com/in/eitan-suchatsky",
      image: null
    }
  ];

  return (
    <section className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {showTitle && (
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
            הצוות המפתח
          </h2>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="panels rounded-xl p-5 shadow-md border text-center hover:shadow-lg transition-shadow duration-300 border-gray-200 dark:border-gray-700"
            >
              
              {/* Profile Image */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
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
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {member.name}
              </h3>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-4 leading-relaxed">
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
      </div>
    </section>
  );
} 