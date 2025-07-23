'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import useWebSocket from '../../hooks/useWebSocket';

export default function ChatPartnersList({ 
  currentUserId, 
  currentUserRole, 
  onSelectPartner, 
  onClose 
}) {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onlineUsers, unreadCounts } = useWebSocket(currentUserId, currentUserRole, 'User');

  // Load chat partners
  useEffect(() => {
    if (!currentUserId || !currentUserRole) return;

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

  // Check if a partner is online
  const isPartnerOnline = (partnerId) => {
    return onlineUsers.some(user => user.userId === partnerId);
  };

  const handleSelectPartner = (partner) => {
    onSelectPartner(partner.id, partner.fullName || partner.email, partner.role);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" dir="rtl">
      <div className="panels rounded-lg shadow-xl w-full max-w-sm sm:w-96 max-h-96 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--input-border)' }}>
          <h3 className="text-lg font-semibold">
            בחר {currentUserRole === 'teacher' ? 'הורה' : 'מורה'} לשיחה
          </h3>
          <button
            onClick={onClose}
            className="btn-close"
          >
            ✕
          </button>
        </div>

        {/* Partners List */}
        <div className="overflow-y-auto max-h-80">
          {loading ? (
            <div className="p-8 text-center opacity-75">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              טוען רשימת שותפים...
            </div>
          ) : partners.length === 0 ? (
            <div className="p-8 text-center opacity-75">
              <div className="text-4xl mb-4">👥</div>
              <p>אין שותפים זמינים לשיחה</p>
              <p className="text-sm mt-2 opacity-60">
                {currentUserRole === 'teacher' ? 
                  'לא נמצאו הורים של תלמידים' : 
                  'לא נמצאו מורים של הילדים'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--input-border)' }}>
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  onClick={() => handleSelectPartner(partner)}
                  className="list-item p-4 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(partner.fullName || partner.email)?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {partner.fullName || partner.email}
                        </h4>
                        <p className="text-sm opacity-75">
                          {partner.role === 'teacher' ? 'מורה' : 'הורה'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {/* Online/Offline indicator */}
                      <div className={`w-3 h-3 rounded-full ${isPartnerOnline(partner.id) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      
                      {/* Unread count badge or read indicator */}
                      {unreadCounts[partner.id] > 0 ? (
                        <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {unreadCounts[partner.id]}
                        </div>
                      ) : (
                        <div className="badge">
                          <span className="opacity-75">אין הודעות</span>
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