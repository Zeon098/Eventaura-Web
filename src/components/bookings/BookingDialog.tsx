import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { addDocument } from '../../services/firebase/firestore.service';
import type { ServiceModel } from '../../types/service.types';
import { Collections, Routes, BookingStatus } from '../../utils/constants';
import { formatCurrency, formatDateKey } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  service: ServiceModel;
}

interface CategorySelection {
  categoryIndex: number;
  quantity: number;
}

export default function BookingDialog({ open, onClose, service }: BookingDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventTime, setEventTime] = useState<Date | null>(null);
  const [eventLocation, setEventLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [selectedCategories, setSelectedCategories] = useState<CategorySelection[]>([
    { categoryIndex: 0, quantity: 1 },
  ]);
  const [notes, setNotes] = useState('');

  const handleCategoryChange = (index: number, field: 'categoryIndex' | 'quantity', value: number) => {
    setSelectedCategories((prev) =>
      prev.map((cat, i) => (i === index ? { ...cat, [field]: value } : cat))
    );
  };

  const handleAddCategory = () => {
    setSelectedCategories((prev) => [...prev, { categoryIndex: 0, quantity: 1 }]);
  };

  const handleRemoveCategory = (index: number) => {
    if (selectedCategories.length === 1) {
      toast.error('At least one category is required');
      return;
    }
    setSelectedCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = (): number => {
    return selectedCategories.reduce((total, selection) => {
      const category = service.categories[selection.categoryIndex];
      if (!category) return total;

      let price = category.price;
      if (category.pricingType === 'per_head') {
        price *= guestCount;
      } else if (category.pricingType === 'per_100_persons') {
        price *= Math.ceil(guestCount / 100);
      }
      
      return total + price * selection.quantity;
    }, 0);
  };

  const validateForm = (): boolean => {
    if (!eventDate) {
      toast.error('Event date is required');
      return false;
    }
    if (!eventLocation.trim()) {
      toast.error('Event location is required');
      return false;
    }
    if (guestCount < 1) {
      toast.error('Guest count must be at least 1');
      return false;
    }
    if (selectedCategories.some((cat) => cat.quantity < 1)) {
      toast.error('All category quantities must be at least 1');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user?.id || !eventDate || !eventTime) return;

    try {
      setSubmitting(true);

      // Calculate end time (1 hour after start time by default)
      const endTime = new Date(eventTime);
      endTime.setHours(endTime.getHours() + 4); // Default 4 hour duration

      const bookingData = {
        serviceId: service.id,
        providerId: service.providerId,
        consumerId: user.id,
        categoryIds: selectedCategories.map((selection) => service.categories[selection.categoryIndex].id),
        categoryNames: selectedCategories.map((selection) => service.categories[selection.categoryIndex].name),
        totalPrice: calculateTotal(),
        date: formatDateKey(eventDate),
        startTime: eventTime,
        endTime: endTime,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: BookingStatus.PENDING,
      };

      await addDocument(Collections.BOOKINGS, bookingData);
      
      toast.success('Booking created successfully!');
      onClose();
      
      // Navigate to bookings page
      navigate(Routes.BOOKINGS);
    } catch (err) {
      console.error('Error creating booking:', err);
      toast.error('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Book Service
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {service.title}
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Date & Time */}
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Event Date *"
                value={eventDate}
                onChange={(newValue) => setEventDate(newValue)}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TimePicker
                label="Event Time (Optional)"
                value={eventTime}
                onChange={(newValue) => setEventTime(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Grid>

            {/* Location */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Event Location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                required
                placeholder="Enter the event venue or address"
              />
            </Grid>

            {/* Guest Count */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Number of Guests"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Categories */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Select Categories</Typography>
                {service.categories.length > 1 && (
                  <Button size="small" onClick={handleAddCategory}>
                    Add Another
                  </Button>
                )}
              </Box>

              {selectedCategories.map((selection, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={selection.categoryIndex}
                          onChange={(e) =>
                            handleCategoryChange(index, 'categoryIndex', Number(e.target.value))
                          }
                          label="Category"
                        >
                          {service.categories.map((cat, catIndex) => (
                            <MenuItem key={catIndex} value={catIndex}>
                              {cat.name} - {formatCurrency(cat.price)}
                              {cat.pricingType !== 'base' && (
                                <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                                  {cat.pricingType === 'per_head' ? '/person' : '/100 persons'}
                                </Typography>
                              )}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 8, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={selection.quantity}
                        onChange={(e) =>
                          handleCategoryChange(index, 'quantity', Number(e.target.value))
                        }
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 4, sm: 2 }}>
                      {selectedCategories.length > 1 && (
                        <Button
                          color="error"
                          onClick={() => handleRemoveCategory(index)}
                          fullWidth
                        >
                          Remove
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Additional Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                placeholder="Any special requirements or instructions..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            {/* Price Summary */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Price Summary
                </Typography>
                {selectedCategories.map((selection, index) => {
                  const category = service.categories[selection.categoryIndex];
                  let itemPrice = category.price;
                  
                  if (category.pricingType === 'per_head') {
                    itemPrice *= guestCount;
                  } else if (category.pricingType === 'per_100_persons') {
                    itemPrice *= Math.ceil(guestCount / 100);
                  }
                  
                  const lineTotal = itemPrice * selection.quantity;

                  return (
                    <Box
                      key={index}
                      sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                    >
                      <Typography variant="body2">
                        {category.name} × {selection.quantity}
                        {category.pricingType === 'per_head' && ` (${guestCount} guests)`}
                      </Typography>
                      <Typography variant="body2">{formatCurrency(lineTotal)}</Typography>
                    </Box>
                  );
                })}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" fontWeight="bold">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Creating...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
