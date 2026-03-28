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

  // ✅ 登录状态（用于登出清理）
  const isLoggedIn = useSelector((state: RootStateProps) => state.auth.isLoggedIn);

  // ✅ 用户数据
  const { data: user, isLoading } = useGetUserInfoQuery();

  // ✅ 防重复绑定
  const crispBoundRef = useRef(false);

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

  // ==================== ✅ 时间格式修复 ==================== //
  const formatExpire = (date?: string) => {
    if (!date) return "Unknown";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "Invalid";
      return d.toISOString().split("T")[0];
    } catch {
      return "Invalid";
    }
  };

  // ==================== ✅ Crisp 用户绑定 ==================== //
  useEffect(() => {
    if (!isLoading && user?.email && !crispBoundRef.current) {
      const interval = setInterval(() => {
        if (window.$crisp) {
          console.log("✅ Crisp 绑定（中等方案）:", user);

          // ✅ 邮箱
          window.$crisp.push(["set", "user:email", user.email]);

          // ✅ 数据（稳定字段）
          window.$crisp.push([
            "set",
            "session:data",
            [[
              ["Plan", user.plan || "Free"],
              ["Expires", formatExpire(user.expired_at)]
            ]]
          ]);

          // ✅ 标签（是否过期）
          const isExpired =
            user.expired_at &&
            new Date(user.expired_at).getTime() < Date.now();

          window.$crisp.push([
            "set",
            "session:segments",
            [isExpired ? "expired" : "active"]
          ]);

          crispBoundRef.current = true;
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [user, isLoading]);

  // ==================== ✅ 登出清理 Crisp ==================== //
  useEffect(() => {
    if (!isLoggedIn) {
      if (window.$crisp) {
        console.log("🧹 Crisp 已重置（用户登出）");

        window.$crisp.push(["do", "session:reset"]);
      }

      // 允许下次重新绑定
      crispBoundRef.current = false;
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
