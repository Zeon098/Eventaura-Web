import { Typography, Box, Avatar, Divider } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import type { AppUser } from '../../../types/user.types';
import { getInitials } from '../../../utils/formatters';

interface ProviderInfoProps {
  provider: AppUser;
}

export default function ProviderInfo({ provider }: ProviderInfoProps) {
  return (
    <>
      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Provider
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          src={provider.photoUrl || undefined}
          alt={provider.displayName || 'Provider'}
          sx={{ width: 48, height: 48, mr: 2 }}
        >
          {getInitials(provider.displayName || provider.email)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {provider.displayName || 'Provider'}
          </Typography>
          {provider.email && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />
              <Typography variant="caption" color="text.secondary">
                {provider.email}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />
    </>
  );
}
