import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  IconButton,
  CircularProgress,
  Fab,
  Alert,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { mapboxGeocodingService } from '../../services/mapbox/geocoding.service';
import type { GeocodingResult } from '../../types/common.types';

interface AddressPickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
  initialLatitude?: number;
  initialLongitude?: number;
}

export default function AddressPickerDialog({
  open,
  onClose,
  onSelect,
  initialAddress = '',
  initialLatitude,
  initialLongitude,
}: AddressPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentLat, setCurrentLat] = useState<number>(initialLatitude || 31.5204);
  const [currentLng, setCurrentLng] = useState<number>(initialLongitude || 74.3587);
  const [locating, setLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const searchTimeoutRef = useRef<number | undefined>(undefined);

  // Load Mapbox GL JS script
  useEffect(() => {
    if (scriptLoaded) return;

    // Check if already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).mapboxgl) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.async = true;
    script.onload = () => {
      const linkEl = document.createElement('link');
      linkEl.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      linkEl.rel = 'stylesheet';
      document.head.appendChild(linkEl);
      setScriptLoaded(true);
    };
    script.onerror = () => {
      setMapError('Failed to load map library');
    };
    document.body.appendChild(script);
  }, [scriptLoaded]);

  // Initialize map when dialog opens and script is loaded
  useEffect(() => {
    
     if (!open || !scriptLoaded  || mapRef.current) return;

    const initMap = () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapboxgl = (window as any).mapboxgl;
        
        if (!mapboxgl) {
          setMapError('Map library not loaded');
          return;
        }
         

        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        if (!token) {
          setMapError('Mapbox token not configured');
          return;
        }

        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [currentLng, currentLat],
          zoom: 15,
        });

        

        map.on('load', () => {
          setMapLoaded(true);
          setMapError(null);
         
        });

        map.on('error', (e: Error) => {
          console.error('Map error:', e);
          setMapError('Failed to load map');
        });

        mapRef.current = map;
      } catch (error) {
        console.error('Map initialization error:', error);
        setMapError('Failed to initialize map');
      }
    };

    // Small delay to ensure container is rendered
    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [open, scriptLoaded, currentLat, currentLng]);

  // Handle search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await mapboxGeocodingService.forward(searchQuery, {
          proximityLat: currentLat,
          proximityLng: currentLng,
          limit: 5,
        });
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, currentLat, currentLng]);

  const handleResultSelect = (result: GeocodingResult) => {
    setCurrentLat(result.latitude);
    setCurrentLng(result.longitude);
    setSearchQuery('');
    setSearchResults([]);
    
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [result.longitude, result.latitude],
        zoom: 15,
        duration: 800,
      });
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setCurrentLat(lat);
      setCurrentLng(lng);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 15,
          duration: 800,
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      alert('Unable to get your current location');
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = async () => {
    const center = mapRef.current?.getCenter();
    const lat = center?.lat || currentLat;
    const lng = center?.lng || currentLng;

    try {
      const result = await mapboxGeocodingService.reverse(lat, lng);
      const address = result?.placeName || initialAddress;
      onSelect(address, lat, lng);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      onSelect(initialAddress, lat, lng);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Pick Location
          <IconButton edge="end" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, position: 'relative' }}>
        {/* Search Bar */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
              }
            }}
            size="small"
            InputProps={{
              endAdornment: searching && <CircularProgress size={20} />,
            }}
          />
        </Box>

        {/* Map Error */}
        {mapError && (
          <Alert severity="error" sx={{ m: 2 }}>
            {mapError}
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 70,
              left: 16,
              right: 16,
              bgcolor: 'background.paper',
              zIndex: 1000,
              maxHeight: 200,
              overflow: 'auto',
              boxShadow: 3,
              borderRadius: 1,
            }}
          >
            <List dense>
              {searchResults.map((result, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemButton onClick={() => handleResultSelect(result)}>
                    <ListItemText
                      primary={result.placeName}
                      primaryTypographyProps={{
                        noWrap: true,
                        fontSize: '0.875rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Map Container */}
        <Box
          ref={mapContainerRef}
          sx={{
            width: '100%',
            height: 'calc(100% - 70px)',
            minHeight: '400px',
            position: 'relative',
            bgcolor: '#f0f0f0',
          }}
        >
          {!mapLoaded && !mapError && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading map...
              </Typography>
            </Box>
          )}

          {/* Center Pin */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -100%)',
              zIndex: 1,
              fontSize: 42,
              color: 'error.main',
              pointerEvents: 'none',
            }}
          >
            📍
          </Box>

          {/* Current Location Button */}
          <Fab
            size="small"
            color="primary"
            disabled={locating}
            onClick={handleUseCurrentLocation}
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 1,
            }}
          >
            {locating ? <CircularProgress size={24} /> : <MyLocationIcon />}
          </Fab>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          startIcon={<CheckIcon />}
        >
          Use This Location
        </Button>
      </DialogActions>
    </Dialog>
  );
}
