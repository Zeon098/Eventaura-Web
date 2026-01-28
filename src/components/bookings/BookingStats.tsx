import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface BookingStatsProps {
  stats: {
    pending: number;
    upcoming: number;
    completed: number;
    total: number;
  };
}

export default function BookingStats({ stats }: BookingStatsProps) {
  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 4,
      }}
    >
      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          height: '100%',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Pending
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.pending}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
              <ScheduleIcon />
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          height: '100%',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Upcoming
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.upcoming}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
              <CheckCircleIcon />
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          height: '100%',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Completed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.completed}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
              <HistoryIcon />
            </Avatar>
          </Box>
        </CardContent>
      </Card>

      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          color: 'white',
          height: '100%',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                Total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
              <TrendingUpIcon />
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
