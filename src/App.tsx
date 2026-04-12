import React, { useEffect } from "react";

// third-party
import { I18nextProvider } from "react-i18next";
import { SnackbarProvider } from "notistack";
import { CacheProvider } from "@emotion/react";

// material-ui
import { GlobalStyles } from "tss-react";
import { useTheme } from "@mui/material/styles";

// ✅ 新增
import { useLocation } from "react-router-dom";

// project import
import Routes from "@/routes";
import ThemeCustomization from "@/themes";
// import RTLLayout from '@/components/RTLLayout';
import ScrollTop from "@/components/ScrollTop";
import cache from "@/themes/cache";
import i18n from "@/i18n";
import usePageAnalyticsEffect from "@/hooks/usePageAnalyticsEffect";
import useAuthStateDetector from "@/hooks/useAuthStateDetector";
import useHtmlLangSelector from "@/hooks/useHtmlLangSelector";
import useTitle from "@/hooks/useTitle";

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
  const theme = useTheme();

  // ✅ 新增
  const location = useLocation();

  usePageAnalyticsEffect();
  useAuthStateDetector();
  useHtmlLangSelector();
  useTitle(null);

  // ✅ 新增（核心：同步页面给 Crisp）
  useEffect(() => {
    if (window.$crisp) {
      window.$crisp.push([
        "set",
        "session:current_page",
        [window.location.href]
      ]);
    }
  }, [location.pathname]);

  return (
    <CacheProvider value={cache}>
      <ThemeCustomization>
        {/* <RTLLayout> */}
        <I18nextProvider i18n={i18n}>
          <ScrollTop>
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center"
              }}
              autoHideDuration={4000}
              dense
            >
              <Routes />
              <GlobalStyles
                styles={{
                  body: {
                    transition: theme.transitions.create("background-color", {
                      duration: theme.transitions.duration.shortest,
                      easing: theme.transitions.easing.easeInOut
                    })
                  }
                }}
              />
            </SnackbarProvider>
          </ScrollTop>
        </I18nextProvider>
        {/* </RTLLayout> */}
      </ThemeCustomization>
    </CacheProvider>
  );
};

export default App;
