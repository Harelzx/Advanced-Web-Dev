export const generateProgressData = () => {
    return {
      quizzesCompleted: Math.floor(Math.random() * 15) + 5,
      averageScore: Math.floor(Math.random() * 20) + 80,
      studyStreak: Math.floor(Math.random() * 7) + 1,
      totalStudyTime: Math.floor(Math.random() * 50) + 20,
      lastActivity: Math.random() > 0.5 ? 'Today' : 'Yesterday',
      subjects: [
        { name: 'Math', score: Math.floor(Math.random() * 20) + 80 },
        { name: 'Science', score: Math.floor(Math.random() * 20) + 75 },
        { name: 'English', score: Math.floor(Math.random() * 20) + 85 }
      ],
      recentActivity: [
        { activity: 'Completed Mathematics Quiz', score: '92%', time: '3 hours ago' },
        { activity: 'Started Science Chapter', score: 'In Progress', time: 'Yesterday' },
        { activity: 'Submitted English Essay', score: 'Grade: A-', time: '2 days ago' }
      ]
    };
  };