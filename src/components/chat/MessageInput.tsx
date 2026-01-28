import { useState, useRef } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import { Send as SendIcon, Image as ImageIcon } from '@mui/icons-material';
import { cloudinaryService } from '../../services/cloudinary/upload.service';
import toast from 'react-hot-toast';

interface MessageInputProps {
  onSend: (text: string, imageUrl?: string) => Promise<void>;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Send immediately without waiting - Firebase will handle it
    const messageToSend = message.trim();
    setMessage('');
    
    try {
      await onSend(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message if failed
      setMessage(messageToSend);
      toast.error('Failed to send message');
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await cloudinaryService.uploadImage(file, 'chat-images');
      await onSend('[Image]', imageUrl);
      toast.success('Image sent!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />
      
      <IconButton
        color="primary"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        sx={{ mb: 0.5 }}
      >
        {uploading ? <CircularProgress size={24} /> : <ImageIcon />}
      </IconButton>

      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled || uploading}
        variant="outlined"
        size="small"
      />
      
      <IconButton
        color="primary"
        onClick={handleSend}
        disabled={!message.trim() || disabled || uploading}
        sx={{ mb: 0.5 }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
