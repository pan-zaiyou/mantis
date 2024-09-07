import { useTheme } from '@mui/material/styles';

const LogoMain = ({ reverse, ...others }: { reverse?: boolean }) => {
  const theme = useTheme();
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', ...others }}>
      <svg width="70" height="70" viewBox="-1.2 -1.2 14.4 14.4" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
        <path
          d="M8.024 2.52 12 6.496l-1.353 1.356-2.623-2.623-.922.926-1.357-1.356zM5.327 5.219 6.68 6.576l1.273 1.269-1.357 1.353-2.619-2.619-2.088 2.088-.535.531L0 7.846 3.976 3.87z"
          fill={theme.palette.mode === 'dark' || reverse ? theme.palette.common.white : theme.palette.common.black}
        />
      </svg>
      <span style={{ fontSize: '20px', fontWeight: 'bold', color: theme.palette.mode === 'dark' || reverse ? theme.palette.common.white : theme.palette.common.black }}>
        跨越长城
      </span>
    </div>
  );
};

export default LogoMain;
