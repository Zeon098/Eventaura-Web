import { Tabs, Tab, Box, Badge } from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

interface BookingTabsProps {
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  counts: {
    pending: number;
    upcoming: number;
    history: number;
  };
}

export default function BookingTabs({ activeTab, onTabChange, counts }: BookingTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onChange={onTabChange}
      variant="fullWidth"
      sx={{
        mb: 0,
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          minHeight: 64,
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(102, 126, 234, 0.05)',
          },
        },
        '& .Mui-selected': {
          color: '#667eea !important',
        },
        '& .MuiTabs-indicator': {
          height: 3,
          bgcolor: '#667eea',
          borderRadius: '3px 3px 0 0',
        },
      }}
    >
      <Tab
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon sx={{ fontSize: 20 }} />
            Requests
            <Badge 
              badgeContent={counts.pending} 
              sx={{ 
                ml: 1,
                '& .MuiBadge-badge': {
                  bgcolor: activeTab === 0 ? '#667eea' : '#9e9e9e',
                  color: 'white',
                  fontWeight: 700,
                }
              }}
            />
          </Box>
        }
      />
      <Tab
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 20 }} />
            Upcoming
            <Badge 
              badgeContent={counts.upcoming} 
              sx={{ 
                ml: 1,
                '& .MuiBadge-badge': {
                  bgcolor: activeTab === 1 ? '#667eea' : '#9e9e9e',
                  color: 'white',
                  fontWeight: 700,
                }
              }}
            />
          </Box>
        }
      />
      <Tab
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon sx={{ fontSize: 20 }} />
            History
            <Badge 
              badgeContent={counts.history} 
              sx={{ 
                ml: 1,
                '& .MuiBadge-badge': {
                  bgcolor: activeTab === 2 ? '#667eea' : '#9e9e9e',
                  color: 'white',
                  fontWeight: 700,
                }
              }}
            />
          </Box>
        }
      />
    </Tabs>
  );
}
