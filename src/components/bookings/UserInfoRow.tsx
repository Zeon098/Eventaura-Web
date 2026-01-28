import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { getDocument } from '../../services/firebase/firestore.service';
import type { AppUser } from '../../types/user.types';
import { Collections } from '../../utils/constants';

interface UserInfoRowProps {
  userId: string;
  isProvider: boolean;
}

export default function UserInfoRow({ userId, isProvider }: UserInfoRowProps) {
  const [userName, setUserName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getDocument<AppUser>(Collections.USERS, userId);
        setUserName(user?.displayName || 'Unknown User');
      } catch (error) {
        console.error('Error loading user:', error);
        setUserName('Unknown User');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
       
        <Typography variant="body2" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
        {isProvider ?  '👤 Customer': '🏢 Provider'}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        {userName}
      </Typography>
    </Box>
  );
}
