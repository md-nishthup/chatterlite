import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GroupNotificationSettings from './GroupNotificationSettings';

export default function Notification() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <GroupNotificationSettings
      groupId={groupId}
      currentUser={currentUser}
      onClose={() => navigate(-1)}
    />
  );
} 