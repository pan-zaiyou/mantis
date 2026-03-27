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

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownLG = useMediaQuery(theme.breakpoints.down("xl"));
  const location = useLocation();

  const { container, miniDrawer } = useConfig();
  const dispatch = useDispatch();

  const menu = useSelector((state: RootStateProps) => state.menu);
  const { drawerOpen } = menu;

  // drawer toggler
  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // 响应式
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

  // =================🔥 最终解决：API 获取用户 + Crisp 绑定 🔥================= //
  useEffect(() => {
    let retry = 0;

    const timer = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/user/info", {
          credentials: "include"
        });

        const data = await res.json();
        const email = data?.data?.email;

        if (window.$crisp && email) {
          console.log("✅ Crisp 绑定成功:", email);

          // ❗关键：重置 session（否则一直 Visitor）
          window.$crisp.push(["do", "session:reset"]);

          // 设置邮箱
          window.$crisp.push(["set", "user:email", [email]]);

          clearInterval(timer);
        }
      } catch (e) {
        // 忽略错误继续重试
      }

      retry++;
      if (retry > 20) {
        clearInterval(timer);
        console.log("❌ Crisp 绑定失败：API 未获取到用户");
      }
    }, 500);

    return () => clearInterval(timer);
  }, []);
  // ======================================================================== //

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
