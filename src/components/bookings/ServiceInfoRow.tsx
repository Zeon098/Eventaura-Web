import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { getDocument } from '../../services/firebase/firestore.service';
import type { ServiceModel } from '../../types/service.types';
import { Collections } from '../../utils/constants';

interface ServiceInfoRowProps {
  serviceId: string;
}

export default function ServiceInfoRow({ serviceId }: ServiceInfoRowProps) {
  const [serviceName, setServiceName] = useState<string>('Loading...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadService = async () => {
      try {
        const serviceData = await getDocument<ServiceModel>(Collections.SERVICES, serviceId);
        setServiceName(serviceData?.title || 'Unknown Service');
      } catch (error) {
        console.error('Error loading service:', error);
        setServiceName('Unknown Service');
      } finally {
        setLoading(false);
      }
    };
    loadService();
  }, [serviceId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        📋 Service
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
        {serviceName}
      </Typography>
    </Box>
  );
}
