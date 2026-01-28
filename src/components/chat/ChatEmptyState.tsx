import { Box, Typography } from '@mui/material';
import { ChatBubbleOutline as ChatIcon } from '@mui/icons-material';

export default function ChatEmptyState() {
  return (
    <Box
      sx={{
        flex: 1,
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <ChatIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Select a conversation
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Choose a chat from the left to start messaging
        </Typography>
      </Box>
    </Box>
  );
}
