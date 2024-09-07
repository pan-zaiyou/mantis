import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO SVG ||============================== //

const LogoMain = ({ reverse, ...others }: { reverse?: boolean }) => {
  const theme = useTheme();
  
  // 根据主题模式设置 SVG 的填充颜色
  const fillColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';

  return (
    <div
      style={{
        position: 'absolute',
        top: '-5px',  // 向下移动一点点
        left: '0px', // 稍微向右移动
        zIndex: 10,
      }}
    >
      <svg width="300" height="300" viewBox="-1.2 -1.2 14.4 14.4" xmlns="http://www.w3.org/2000/svg">
  <g stroke-width="0"/>
  <g stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8.024 2.52 12 6.496l-1.353 1.356-2.623-2.623-.922.926-1.357-1.356zM5.327 5.219 6.68 6.576l1.273 1.269-1.357 1.353-2.619-2.619-2.088 2.088-.535.531L0 7.846 3.976 3.87z"/>
</svg>
    </div>
  );
};

export default LogoMain;
