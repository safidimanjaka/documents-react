import { CircularProgress, Box } from '@mui/material';

const Loader = ({ size = 40 }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
    <CircularProgress size={size} />
  </Box>
);

export default Loader;