import React from 'react';
import { useTheme } from '@mui/material/styles';

// 导入 SVG 文件作为组件
import { ReactComponent as LogoDark } from 'assets/images/logo-dark.svg';
import { ReactComponent as Logo } from 'assets/images/logo.svg';

// LogoMain 组件
const LogoMain = ({ reverse, ...others }) => {
  const theme = useTheme();

  // 根据主题模式选择不同的 SVG 组件
  const LogoComponent = theme.palette.mode === 'dark' ? LogoDark : Logo;

  return (
    <LogoComponent width="100" height="auto" {...others} />
  );
};

export default LogoMain;
