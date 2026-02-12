import { Box, Typography, ImageList, ImageListItem } from '@mui/material';

interface ServiceImageGalleryProps {
  title: string;
  images: string[];
}

export default function ServiceImageGallery({ title, images }: ServiceImageGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          backgroundColor: 'grey.200',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">No images available</Typography>
      </Box>
    );
  }

  return (
    <ImageList
      cols={1}
      gap={8}
      sx={{ borderRadius: 2, overflow: 'hidden' }}
    >
      {images.map((image: string, index: number) => (
        <ImageListItem key={index}>
          <img
            src={image}
            alt={`${title} - ${index + 1}`}
            style={{
              width: '100%',
              height: index === 0 ? '400px' : '300px',
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}
