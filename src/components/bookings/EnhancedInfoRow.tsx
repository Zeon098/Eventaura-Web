import { Box, Paper, Stack, Typography } from '@mui/material';

interface EnhancedInfoRowProps {
  icon: string;
  label: string;
  value: string;
  bgcolor?: string;
}

export default function EnhancedInfoRow({ icon, label, value, bgcolor }: EnhancedInfoRowProps) {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2,
        borderRadius: 2,
        background: bgcolor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        height: '100%',
      }}
    >
      <Stack spacing={0.5}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 20, mr: 1 }}>{icon}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, fontSize: '0.75rem' }}>
            {label}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}
