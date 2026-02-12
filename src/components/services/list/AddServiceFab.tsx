import { Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../../../utils/constants';

export default function AddServiceFab() {
  const navigate = useNavigate();

  return (
    <Fab
      color="primary"
      aria-label="add service"
      sx={{ position: 'fixed', bottom: 24, right: 24 }}
      onClick={() => navigate(Routes.SERVICE_FORM)}
    >
      <AddIcon />
    </Fab>
  );
}
