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

  const currentUser = useSelector(
    (state: RootStateProps) => state.user?.userInfo
  );

  const [open, setOpen] = useState(!miniDrawer || drawerOpen);

  const handleDrawerToggle = () => {
    setOpen(!open);
    dispatch(openDrawer({ drawerOpen: !open }));
  };

  // responsive drawer
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

  // ================= CRISP 用户绑定（已优化稳定版） ================= //
  useEffect(() => {
    if (!currentUser?.email) return;

    let attempts = 0;

    const timer = setInterval(() => {
      attempts++;

      if (window.$crisp && Array.isArray(window.$crisp)) {
        clearInterval(timer);

        console.log("Crisp 用户绑定成功:", currentUser);

        // 用户邮箱（核心识别）
        window.$crisp.push([
          "set",
          "user:email",
          currentUser.email
        ]);

        // 用户昵称
        window.$crisp.push([
          "set",
          "user:nickname",
          currentUser.nickname || currentUser.email
        ]);

        // session 数据（客服后台可见）
        window.$crisp.push([
          "set",
          "session:data",
          {
            user_id: String(currentUser.id),
            email: currentUser.email,
            nickname: currentUser.nickname || ""
          }
        ]);
      }

      if (attempts > 20) {
        clearInterval(timer);
        console.warn("Crisp 初始化超时");
      }
    }, 300);

    return () => clearInterval(timer);
  }, [currentUser]);
  // ================================================= //

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
