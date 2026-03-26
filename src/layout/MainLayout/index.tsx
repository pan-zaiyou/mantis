import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// ✅ 获取用户信息
import { useGetUserInfoQuery } from "@/store/services/api";

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

  // ✅ 获取用户信息
  const { data } = useGetUserInfoQuery();

  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

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

  // ✅ ✅ Crisp 完整绑定（终极稳定版）
  useEffect(() => {
    if (!window.$crisp || !data) return;

    const userData = data?.data || data;

    console.log("🔥 userData:", userData); // 👉 调试用

    // ✅ email 兼容
    const email =
      userData?.email ||
      userData?.auth_data?.email ||
      userData?.user?.email;

    if (!email) {
      console.warn("❌ 没拿到 email");
      return;
    }

    // ✅ 防重复绑定
    const lastEmail = localStorage.getItem("crisp_email");
    if (lastEmail === email) {
      console.log("🟡 Crisp 已绑定");
      return;
    }
    localStorage.setItem("crisp_email", email);

    // ✅ 用户ID
    const userId =
      userData?.id ||
      userData?.user_id ||
      userData?.user?.id ||
      "unknown";

    // ✅ 套餐（兼容多结构）
    const plan =
      userData?.plan?.name ||
      userData?.plan?.title ||
      userData?.group?.name ||
      userData?.plan_id ||
      userData?.user?.plan_id ||
      "Free";

    // ✅ 流量（标准 v2board）
    const transferEnable =
      userData?.transfer_enable ||
      userData?.user?.transfer_enable ||
      0;

    const usedTraffic =
      (userData?.u || userData?.user?.u || 0) +
      (userData?.d || userData?.user?.d || 0);

    const remaining = transferEnable - usedTraffic;

    const toGB = (val: number) =>
      (val / 1024 / 1024 / 1024).toFixed(2);

    console.log("🟢 Crisp绑定:", {
      email,
      userId,
      plan,
      transferEnable,
      usedTraffic
    });

    // ✅ 设置用户
    window.$crisp.push(["set", "user:email", email]);
    window.$crisp.push(["set", "user:nickname", email]);

    // ✅ 扩展信息
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

  }, [data]);

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
