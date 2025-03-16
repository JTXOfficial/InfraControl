import { Box } from '@mui/material';

/**
 * Custom TabPanel component for tabbed interfaces
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Tab content
 * @param {number} props.value - Current tab value
 * @param {number} props.index - This tab's index
 * @returns {JSX.Element} TabPanel component
 */
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`instance-tabpanel-${index}`}
      aria-labelledby={`instance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default TabPanel; 