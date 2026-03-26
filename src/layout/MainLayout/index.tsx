import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// material-ui
import { useTheme } from "@mui/material/styles";
import { useMediaQuery, Box, Container, Toolbar } from "@mui/material";

// project import
import Drawer from "./Drawer";
import Header from "./Header";
import Footer from "./Footer";
import navigation from "@/menu-items";
import useConfig from "@/hooks/useConfig";
import Breadcrumbs from "@/components/@extended/Breadcrumbs";

// types
import { RootStateProps } from "@/types/root";
import { openDrawer } from "@/store/reducers/menu";

const MainLayout = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down("xl"));
  const location = useLocation();

  const { container, miniDrawer } = useConfig();
  const dispatch = useDispatch();

  const menu = useSelector((state: RootStateProps) => state.menu);
  const { drawerOpen } = menu;

  const user = useSelector((state: RootStateProps) => state.user?.profile);

  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // ==================== Crisp 初始化 ====================
  useEffect(() => {
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = "0d31a6be-2276-432f-bd47-ac8d962e84ae";

    if (!document.getElementById("crisp-script")) {
      const script = document.createElement("script");
      script.id = "crisp-script";
      script.src = "https://client.crisp.chat/l.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // ==================== 登录用户邮箱/账号自动识别 ====================
  useEffect(() => {
    if (!user || !user.email) return;

    const interval = setInterval(() => {
      const crisp = (window as any).$crisp;
      if (crisp && crisp.push) {
        // 设置邮箱
        crisp.push(["set", "user:email", [user.email]]);
        // 设置唯一用户ID
        crisp.push(["set", "user:identifier", [user.email]]);
        // 可选：设置 session 数据（比如套餐）
        if (user.plan) {
          crisp.push(["set", "session:data", [[["plan", user.plan]]]]);
        }
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [user]);

  // ==================== 登出时重置 ====================
  useEffect(() => {
    if (user === null && (window as any).$crisp) {
      (window as any).$crisp.push(["do", "session:reset"]);
    }
  }, [user]);

  // ==================== Drawer 响应式 ====================
  useEffect(() => {
    if (!miniDrawer) {
      setOpen(!matchDownLG);
      dispatch(openDrawer({ drawerOpen: !matchDownLG }));
    }
  }, [matchDownLG]);

  useEffect(() => {
    if (matchDownLG) {
      setOpen(false);
      dispatch(openDrawer({ drawerOpen: false }));
    }
  }, [location.pathname, matchDownLG]);

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ width: "calc(100% - 260px)", flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar />
        {container && (
          <Container
            maxWidth="xl"
            sx={{
              px: { xs: 0, sm: 2 },
              position: "relative",
              minHeight: "calc(100vh - 110px)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} />
            <Outlet />
            <Footer />
          </Container>
        )}
        {!container && (
          <Box
            sx={{ position: "relative", minHeight: "calc(100vh - 110px)", display: "flex", flexDirection: "column" }}
          >
            <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} />
            <Outlet />
            <Footer />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MainLayout;
