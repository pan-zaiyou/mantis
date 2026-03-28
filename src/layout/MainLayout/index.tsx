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

// ✅ 用户接口
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

  // ✅ 登录状态
  const isLoggedIn = useSelector((state: RootStateProps) => state.auth.isLoggedIn);

  // ✅ 用户数据
  const { data: user, isLoading } = useGetUserInfoQuery();

  // ✅ 防重复执行（开发环境很重要）
  const lastEmailRef = useRef<string | null>(null);

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
  }, [matchDownLG, miniDrawer, dispatch]);

  useEffect(() => {
    if (matchDownLG) {
      setOpen(false);
      dispatch(openDrawer({ drawerOpen: false }));
    }
  }, [location.pathname, matchDownLG, dispatch]);

  // ==================== ✅ Crisp 登录绑定（核心修复） ==================== //
  useEffect(() => {
    if (!isLoading && user?.email && window.$crisp) {
      // ✅ 防止重复绑定同一个用户
      if (lastEmailRef.current === user.email) return;

      console.log("👤 Crisp 切换用户:", user.email);

      // 🔥 关键：每次登录前都 reset（防串号）
      window.$crisp.push(["do", "session:reset"]);

      // ✅ 绑定邮箱
      window.$crisp.push(["set", "user:email", user.email]);

      // ✅ 记录当前用户
      lastEmailRef.current = user.email;
    }
  }, [user?.email, isLoading]);

  // ==================== ✅ 登出清理 ==================== //
  useEffect(() => {
    if (!isLoggedIn && window.$crisp) {
      console.log("🧹 Crisp 已重置（登出）");

      window.$crisp.push(["do", "session:reset"]);

      // ✅ 清空记录（允许下次重新绑定）
      lastEmailRef.current = null;
    }
  }, [isLoggedIn]);

  // ==================== UI ==================== //

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{ width: "calc(100% - 260px)", flexGrow: 1, p: { xs: 2, sm: 3 } }}
      >
        <Toolbar />

        {container ? (
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
            <Breadcrumbs
              navigation={navigation}
              title
              titleBottom
              card={false}
              divider={false}
            />
            <Outlet />
            <Footer />
          </Container>
        ) : (
          <Box
            sx={{
              position: "relative",
              minHeight: "calc(100vh - 110px)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Breadcrumbs
              navigation={navigation}
              title
              titleBottom
              card={false}
              divider={false}
            />
            <Outlet />
            <Footer />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MainLayout;
