import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserInfoQuery } from "@/store/services/api";

import { useTheme } from "@mui/material/styles";
import { useMediaQuery, Box, Container, Toolbar } from "@mui/material";

import Drawer from "./Drawer";
import Header from "./Header";
import Footer from "./Footer";
import navigation from "@/menu-items";
import useConfig from "@/hooks/useConfig";
import Breadcrumbs from "@/components/@extended/Breadcrumbs";

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

  const { data } = useGetUserInfoQuery();

  const [open, setOpen] = useState(!miniDrawer || drawerOpen);

  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // ================= Drawer =================
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

  // ================= 🔥 Crisp 动态加载 =================
  const loadCrisp = () => {
    if (window.CRISP_LOADED) return;

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "0d31a6be-2276-432f-bd47-ac8d962e84ae";

    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    window.CRISP_LOADED = true;
  };

  // ================= 🔥 用户绑定 =================
  useEffect(() => {
    if (!data) return;

    const userData = data?.data || data;

    const email =
      userData?.email ||
      userData?.auth_data?.email ||
      userData?.user?.email;

    if (!email) return;

    // ✅ 防重复
    const lastEmail = localStorage.getItem("crisp_email");
    if (lastEmail === email) return;

    localStorage.setItem("crisp_email", email);

    // ✅ 先加载 Crisp
    loadCrisp();

    const userId =
      userData?.id ||
      userData?.user_id ||
      userData?.user?.id ||
      "unknown";

    const plan =
      userData?.plan?.name ||
      userData?.plan?.title ||
      userData?.group?.name ||
      userData?.plan_id ||
      "Free";

    const transferEnable = userData?.transfer_enable || 0;
    const usedTraffic =
      (userData?.u || 0) + (userData?.d || 0);
    const remaining = transferEnable - usedTraffic;

    const toGB = (val: number) =>
      (val / 1024 / 1024 / 1024).toFixed(2);

    // ⏳ 等 Crisp 初始化
    setTimeout(() => {
      window.$crisp.push(["set", "user:email", email]);
      window.$crisp.push(["set", "user:nickname", email]);

      window.$crisp.push([
        "set",
        "session:data",
        [
          ["UID", String(userId)],
          ["Plan", String(plan)],
          ["Total", `${toGB(transferEnable)} GB`],
          ["Used", `${toGB(usedTraffic)} GB`],
          ["Remaining", `${toGB(remaining)} GB`]
        ]
      ]);
    }, 1200);

  }, [data]);

  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Header open={open} handleDrawerToggle={handleDrawerToggle} />
      <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />
      <Box component="main" sx={{ width: "calc(100% - 260px)", flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar />
        {container ? (
          <Container maxWidth="xl" sx={{ minHeight: "calc(100vh - 110px)", display: "flex", flexDirection: "column" }}>
            <Breadcrumbs navigation={navigation} title titleBottom card={false} divider={false} />
            <Outlet />
            <Footer />
          </Container>
        ) : (
          <Box sx={{ minHeight: "calc(100vh - 110px)", display: "flex", flexDirection: "column" }}>
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
