// material-ui
import { useTheme } from '@mui/material/styles';
import logoDark from 'assets/images/logo-dark.svg';
import logo from 'assets/images/logo.svg';

// ==============================|| LOGO SVG ||============================== //

const LogoMain = ({ reverse, ...others }: { reverse?: boolean }) => {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src={theme.palette.mode === 'dark' ? logoDark : logo} 
        alt="跨越长城" 
        width="100" 
      />
      <span style={{ marginLeft: '10px', fontSize: '18px', fontWeight: 'bold' }}>MOEU</span>
    </div>
  );
};

export default LogoMain;
