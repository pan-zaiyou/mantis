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

  // drawer toggler
  const [open, setOpen] = useState(!miniDrawer || drawerOpen);
  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // 响应式抽屉
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

  // ✅ ✅ Crisp 用户绑定（最终稳定版）
  useEffect(() => {
    if (!window.$crisp || !data) return;

    const userData = data?.data || data;

    const email =
      userData?.email ||
      userData?.auth_data?.email;

    const userId =
      userData?.id ||
      userData?.user_id ||
      "unknown";

    const plan =
      userData?.plan?.name ||
      userData?.plan?.title ||
      userData?.group?.name ||
      "Unknown";

    const transferEnable = userData?.transfer_enable || 0;
    const usedTraffic =
      (userData?.u || 0) + (userData?.d || 0);
    const remaining = transferEnable - usedTraffic;

    if (!email) {
      console.warn("❌ Crisp: 没拿到 email");
      return;
    }

    // ✅ 防重复（跨刷新也生效）
    const lastEmail = localStorage.getItem("crisp_email");
    if (lastEmail === email) {
      console.log("🟡 Crisp 已绑定，无需重复");
      return;
    }

    console.log("🟢 绑定 Crisp 用户:", email);

    localStorage.setItem("crisp_email", email);

    // ✅ 设置用户信息
    window.$crisp.push(["set", "user:email", email]);
    window.$crisp.push(["set", "user:nickname", email]);

    // ✅ 扩展信息（客服可见）
    window.$crisp.push([
      "set",
      "session:data",
      [
        ["UID", String(userId)],
        ["Plan", String(plan)],
        ["Total Traffic", `${(transferEnable / 1024 / 1024 / 1024).toFixed(2)} GB`],
        ["Used Traffic", `${(usedTraffic / 1024 / 1024 / 1024).toFixed(2)} GB`],
        ["Remaining", `${(remaining / 1024 / 1024 / 1024).toFixed(2)} GB`]
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
