import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

// third-party
import { I18nextProvider } from "react-i18next";
import { SnackbarProvider } from "notistack";
import { CacheProvider } from "@emotion/react";

// material-ui
import { GlobalStyles } from "tss-react";
import { useTheme } from "@mui/material/styles";

// project import
import Routes from "@/routes";
import ThemeCustomization from "@/themes";
import ScrollTop from "@/components/ScrollTop";
import cache from "@/themes/cache";
import i18n from "@/i18n";
import usePageAnalyticsEffect from "@/hooks/usePageAnalyticsEffect";
import useAuthStateDetector from "@/hooks/useAuthStateDetector";
import useHtmlLangSelector from "@/hooks/useHtmlLangSelector";
import useTitle from "@/hooks/useTitle";

// store
import { useDispatch } from "@/store";
import { logout } from "@/store/reducers/auth";

const App = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  usePageAnalyticsEffect();
  const isLogin = useAuthStateDetector();
  useHtmlLangSelector();
  useTitle(null);

  const location = useLocation();

  // 页面变化同步 Crisp
  useEffect(() => {
    if (window.$crisp) {
      window.$crisp.push([
        "set",
        "session:current_page",
        [window.location.href],
      ]);
    }
  }, [location.pathname]);

  // Logout 函数示例（按钮调用即可）
  const handleLogout = () => {
    if (window.$crisp) {
      window.$crisp.push(["set", "user:email", []]);
      window.$crisp.push(["set", "user:nickname", []]);
    }
    dispatch(logout());
  };

  return (
    <CacheProvider value={cache}>
      <ThemeCustomization>
        <I18nextProvider i18n={i18n}>
          <ScrollTop>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              autoHideDuration={4000}
              dense
            >
              {/* 可在任何按钮绑定 handleLogout */}
              <Routes />
              <GlobalStyles
                styles={{
                  body: {
                    transition: theme.transitions.create("background-color", {
                      duration: theme.transitions.duration.shortest,
                      easing: theme.transitions.easing.easeInOut,
                    }),
                  },
                }}
              />
            </SnackbarProvider>
          </ScrollTop>
        </I18nextProvider>
      </ThemeCustomization>
    </CacheProvider>
  );
};

export default App;
