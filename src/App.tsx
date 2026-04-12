import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { CacheProvider } from "@emotion/react";
import { I18nextProvider } from "react-i18next";
import { SnackbarProvider } from "notistack";
import { useTheme } from "@mui/material/styles";

import AppRoutes from "@/routes";
import ThemeCustomization from "@/themes";
import ScrollTop from "@/components/ScrollTop";
import i18n from "@/i18n";
import cache from "@/themes/cache";
import useAuthStateDetector from "@/hooks/useAuthStateDetector";
import useHtmlLangSelector from "@/hooks/useHtmlLangSelector";
import useTitle from "@/hooks/useTitle";

const App = () => {
  const theme = useTheme();
  const isLogin = useAuthStateDetector();
  useHtmlLangSelector();
  useTitle(null);
  const location = useLocation();

  // 页面状态同步给 Crisp
  useEffect(() => {
    if (window.$crisp) {
      window.$crisp.push([
        "set",
        "session:current_page",
        [window.location.href],
      ]);
    }
  }, [location.pathname]);

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
              <AppRoutes />
            </SnackbarProvider>
          </ScrollTop>
        </I18nextProvider>
      </ThemeCustomization>
    </CacheProvider>
  );
};

export default App;
