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

  // ✅ v2board 数据（重点）
  const user = useSelector((state: RootStateProps) => state.user?.user);
  const subscribe = useSelector((state: RootStateProps) => state.user?.subscribe);

  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // ===================== ✅ Crisp 初始化 =====================
  useEffect(() => {
    if ((window as any).CRISP_WEBSITE_ID) return;

    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = "0d31a6be-2276-432f-bd47-ac8d962e84ae";

    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;

    document.head.appendChild(s);

    // ❗ 禁止自动弹出
    (window as any).$crisp.push(["do", "chat:hide"]);
  }, []);
  // =======================================================

  // ===================== ✅ Crisp 用户数据（使用 subscribe） =====================
  useEffect(() => {
    if (!user || !subscribe) return;

    const timer = setInterval(() => {
      if (!(window as any).$crisp) return;

      const used = (subscribe.u || 0) + (subscribe.d || 0);
      const total = subscribe.transfer_enable || 0;
      const left = total - used > 0 ? total - used : 0;

      const toGB = (v: number) =>
        (v / 1024 / 1024 / 1024).toFixed(2) + " GB";

      const expire = subscribe.expired_at
        ? new Date(subscribe.expired_at * 1000).toLocaleString()
        : "永久";

      (window as any).$crisp.push(["set", "user:email", [user.email]]);
      (window as any).$crisp.push(["set", "user:nickname", [user.email]]);

      (window as any).$crisp.push([
        "set",
        "session:data",
        [
          ["套餐", user.plan?.name || "无套餐"],
          ["总流量", toGB(total)],
          ["已用流量", toGB(used)],
          ["剩余流量", toGB(left)],
          ["到期时间", expire]
        ]
      ]);

      clearInterval(timer);
    }, 500);

    return () => clearInterval(timer);
  }, [user, subscribe]);
  // =======================================================

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
