import { useEffect, useState, useRef } from "react";
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

// ✅ 新增：获取用户
import { useGetUserInfoQuery } from "@/store/services/api";

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

  // ✅ 用户信息
  const { data: user, isLoading } = useGetUserInfoQuery();

  // ✅ 防止重复绑定
  const crispBoundRef = useRef(false);

  // drawer toggler
  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // set media wise responsive drawer
  useEffect(() => {
    if (!miniDrawer) {
      setOpen(!matchDownLG);
      dispatch(openDrawer({ drawerOpen: !matchDownLG }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchDownLG]);

  useEffect(() => {
    if (matchDownLG) {
      setOpen(false);
      dispatch(openDrawer({ drawerOpen: false }));
    }
  }, [location.pathname, matchDownLG]);

  // ==================== ✅ Crisp 用户绑定（最终版） ==================== //

  useEffect(() => {
    if (!isLoading && user?.email && !crispBoundRef.current) {
      const interval = setInterval(() => {
        if (window.$crisp) {
          console.log("✅ Crisp 绑定成功:", user.email);

          window.$crisp.push(["set", "user:email", user.email]);
          window.$crisp.push(["set", "user:nickname", user.email]);

          // 👉 可扩展（以后你可以加）
          // window.$crisp.push(["set", "session:data", [[["plan", "free"]]]]);

          crispBoundRef.current = true; // ✅ 标记已绑定
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [user, isLoading]);

  // ==================== UI ==================== //

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
