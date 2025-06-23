'use client';

import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc } from 'firebase/firestore';
import useWebSocket from '../../hooks/useWebSocket';

export default function ChatPartnersList({ 
  currentUserId, 
  currentUserRole, 
  onSelectPartner, 
  onClose 
}) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const { onlineUsers } = useWebSocket();

  // Load potential chat partners based on user role
  useEffect(() => {
    if (!currentUserId) return;

    const loadPartners = async () => {
      try {
        setLoading(true);
        let partnersData = [];

        if (currentUserRole === 'teacher') {
          // For teachers: get parents of their students
          // First get teacher's students
          const studentsQuery = query(
            collection(db, 'users'),
            where('role', '==', 'student'),
            where('teacherId', '==', currentUserId)
          );
          const studentsSnapshot = await getDocs(studentsQuery);
          
          // Get unique parent IDs
          const parentIds = new Set();
          studentsSnapshot.docs.forEach(doc => {
            const studentData = doc.data();
            if (studentData.parentId) {
              parentIds.add(studentData.parentId);
            }
          });

          // Get parent details
          for (const parentId of parentIds) {
            const parentDoc = await getDoc(doc(db, 'users', parentId));
            if (parentDoc.exists()) {
              partnersData.push({
                id: parentId,
                ...parentDoc.data(),
                role: 'parent'
              });
            }
          }

        } else if (currentUserRole === 'parent') {
          // For parents: get teachers of their children
          // First get parent's children
          const childrenQuery = query(
            collection(db, 'users'),
            where('role', '==', 'student'),
            where('parentId', '==', currentUserId)
          );
          const childrenSnapshot = await getDocs(childrenQuery);
          
          // Get unique teacher IDs
          const teacherIds = new Set();
          childrenSnapshot.docs.forEach(doc => {
            const childData = doc.data();
            if (childData.teacherId) {
              teacherIds.add(childData.teacherId);
            }
          });

          // Get teacher details
          for (const teacherId of teacherIds) {
            const teacherDoc = await getDoc(doc(db, 'users', teacherId));
            if (teacherDoc.exists()) {
              partnersData.push({
                id: teacherId,
                ...teacherDoc.data(),
                role: 'teacher'
              });
            }
          }
        }

        setPartners(partnersData);
      } catch (error) {
        console.error('Error loading chat partners:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPartners();
  }, [currentUserId, currentUserRole]);

  // Load unread message counts for each partner - DISABLED FOR WEBSOCKET-ONLY MODE
  useEffect(() => {
    console.log('🔥 Unread counts Firebase listener disabled - using WebSocket only');
    // DISABLED: Firebase real-time listener for unread counts
    // Will be handled by WebSocket notifications instead
    
    // if (!currentUserId || partners.length === 0) return;

    // const unsubscribes = partners.map(partner => {
    //   const messagesRef = collection(db, 'users', currentUserId, 'chats', partner.id, 'messages');
    //   // Simplified query - only filter by read status, then filter sender in code
    //   const unreadQuery = query(messagesRef, where('read', '==', false));
      
    //   return onSnapshot(unreadQuery, (snapshot) => {
    //     // Filter out messages sent by current user
    //     const unreadFromPartner = snapshot.docs.filter(doc => {
    //       const messageData = doc.data();
    //       return messageData.sender !== currentUserRole;
    //     });
        
    //     setUnreadCounts(prev => ({
    //       ...prev,
    //       [partner.id]: unreadFromPartner.length
    //     }));
    //   });
    // });

    // return () => {
    //   unsubscribes.forEach(unsub => unsub());
    // };
  }, [currentUserId, currentUserRole, partners]);

  // Check if a partner is online
  const isPartnerOnline = (partnerId) => {
    return onlineUsers.some(user => user.userId === partnerId);
  };

  const handleSelectPartner = (partner) => {
    onSelectPartner(partner.id, partner.fullName || partner.email, partner.role);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            בחר {currentUserRole === 'teacher' ? 'הורה' : 'מורה'} לשיחה
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ✕
          </button>
        </div>

        {/* Partners List */}
        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              טוען רשימת שותפים...
            </div>
          ) : partners.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <p>אין שותפים זמינים לשיחה</p>
              <p className="text-sm mt-2">
                {currentUserRole === 'teacher' ? 
                  'לא נמצאו הורים של תלמידים' : 
                  'לא נמצאו מורים של הילדים'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  onClick={() => handleSelectPartner(partner)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(partner.fullName || partner.email)?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {partner.fullName || partner.email}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {partner.role === 'teacher' ? 'מורה' : 'הורה'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Online/Offline indicator - left side */}
                    <div className={`w-3 h-3 rounded-full ${isPartnerOnline(partner.id) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {/* Unread count badge */}
                      {unreadCounts[partner.id] > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {unreadCounts[partner.id]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 