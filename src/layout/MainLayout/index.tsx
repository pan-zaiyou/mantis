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

  // ✅ 这里获取用户（关键）
  const user = useSelector((state: RootStateProps) => state.user?.user);

  // drawer toggler
  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // ===================== ✅ Crisp 加载 =====================
  useEffect(() => {
    if ((window as any).CRISP_WEBSITE_ID) return;

    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = "0d31a6be-2276-432f-bd47-ac8d962e84ae";

    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;

    document.head.appendChild(s);
  }, []);
  // =======================================================

  // ===================== ✅ Crisp 用户数据 =====================
  useEffect(() => {
    if (!user) return;

    const used = (user.u || 0) + (user.d || 0);
    const total = user.transfer_enable || 0;
    const left = total - used;

    const leftSafe = left > 0 ? left : 0;

    const formatGB = (val: number) =>
      (val / 1024 / 1024 / 1024).toFixed(2) + " GB";

    const formatTime = (ts: number) => {
      if (!ts) return "永久";
      return new Date(ts * 1000).toLocaleString();
    };

    (window as any).$crisp = (window as any).$crisp || [];

    // ⭐ 刷新 session（关键）
    (window as any).$crisp.push(["do", "session:reset"]);

    // 用户信息
    (window as any).$crisp.push(["set", "user:email", [user.email]]);
    (window as any).$crisp.push(["set", "user:nickname", [user.email]]);

    // 自定义数据
    (window as any).$crisp.push([
      "set",
      "session:data",
      [
        ["套餐", user.plan?.name || "无套餐"],
        ["总流量", formatGB(total)],
        ["已用流量", formatGB(used)],
        ["剩余流量", formatGB(leftSafe)],
        ["到期时间", formatTime(user.expired_at)]
      ]
    ]);
  }, [user]);
  // =======================================================

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
