import { Paper, TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
}: SearchBarProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        elevation={2}
        sx={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: 700,
          p: '4px 8px',
          borderRadius: 2,
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: 4,
          },
        }}
      >
        <InputAdornment position="start" sx={{ ml: 1 }}>
          <SearchIcon color="action" />
        </InputAdornment>
        <TextField
          fullWidth
          placeholder="Search for services, categories, or locations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          variant="standard"
          disabled={showFilters}
          InputProps={{
            disableUnderline: true,
            sx: { px: 1, fontSize: '1rem' },
          }}
        />
        <IconButton
          onClick={onToggleFilters}
          color={showFilters ? 'primary' : 'default'}
          sx={{
            ml: 1,
            transition: 'transform 0.3s',
            transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <FilterIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}
