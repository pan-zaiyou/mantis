import { useTheme } from '@mui/material/styles';
import LogoLight from 'src/assets/images/logo.svg';
import LogoDark from 'src/assets/images/logo-dark.svg';

const LogoMain = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <div
      style={{
        position: 'absolute',
        top: '-5px',
        left: '0px',
        zIndex: 10,
      }}
    >
      <img
        src={isDarkMode ? LogoDark : LogoLight} // 根据主题模式选择不同的SVG
        alt="Logo"
        style={{
          width: '125px',
          height: '125px',
        }}
      />
    </div>
  );
};

export default LogoMain;
