import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface ImageUploadSectionProps {
  images: string[];
  uploading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export default function ImageUploadSection({
  images,
  uploading,
  onUpload,
  onRemove,
}: ImageUploadSectionProps) {
  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Images
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Images'}
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={onUpload}
              />
            </Button>
          </Box>
          {images.length > 0 && (
            <ImageList cols={4} gap={8}>
              {images.map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image}
                    alt={`Service image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 4,
                    }}
                  />
                  <ImageListItemBar
                    actionIcon={
                      <IconButton
                        sx={{ color: 'white' }}
                        onClick={() => onRemove(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
