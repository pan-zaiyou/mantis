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

// 👇 防止 TS 报错
declare global {
  interface Window {
    $crisp: any;
  }
}

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down("xl"));
  const location = useLocation();

  const { container, miniDrawer } = useConfig();
  const dispatch = useDispatch();

  const menu = useSelector((state: RootStateProps) => state.menu);
  const { drawerOpen } = menu;

  // 👇 用户信息（根据你的实际结构自动兼容）
  const user = useSelector((state: RootStateProps) => state.user);

  // drawer toggler
  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // 响应式 drawer
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

  // ================== ✅ Crisp 显示账号（最终版） ==================
  useEffect(() => {
    if (!user) return;

    // 👇 兼容不同结构
    const email =
      user?.email ||
      user?.userInfo?.email ||
      user?.data?.email;

    if (!email) return;

    const timer = setInterval(() => {
      if (window.$crisp) {
        // 👇 关键：重置 session（否则一直 visitor）
        window.$crisp.push(["do", "session:reset"]);

        // 👇 让左侧列表显示账号
        window.$crisp.push(["set", "user:nickname", [email]]);

        // 👇 后台详情使用
        window.$crisp.push(["set", "user:email", [email]]);

        console.log("Crisp 已绑定用户:", email);

        clearInterval(timer);
      }
    }, 300);

    return () => clearInterval(timer);
  }, [user]);
  // ============================================================

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          width: "calc(100% - 260px)",
          flexGrow: 1,
          p: { xs: 2, sm: 3 }
        }}
      >
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
            sx={{
              position: "relative",
              minHeight: "calc(100vh - 110px)",
              display: "flex",
              flexDirection: "column"
            }}
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
