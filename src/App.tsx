import React, { useEffect } from "react";

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

// ==============================|| APP - THEME, ROUTER, LOCAL  ||============================== //

const App = () => {
  const theme = useTheme();

  usePageAnalyticsEffect();
  useAuthStateDetector();
  useHtmlLangSelector();
  useTitle(null);

  // --- 【全自动 Crisp 监控中心：解决实时路径 + 多账号同步】 ---
  useEffect(() => {
    const handleCrispLogic = () => {
      try {
        // 1. 获取当前登录用户
        const rawUser = localStorage.getItem('user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const currentEmail = user?.email || user?.data?.email || null;

        // 2. 获取上一次同步的邮箱
        const lastEmail = window.sessionStorage.getItem('crisp_sync_lock');

        // 3. 处理账号切换逻辑
        if (currentEmail) {
          if (currentEmail !== lastEmail) {
            // 如果邮箱变了，先重置再设置（彻底杜绝双对话）
            if (window.$crisp) {
              window.$crisp.push(["do", "session:reset"]);
              window.$crisp.push(["set", "user:email", [currentEmail]]);
              if (user.nickname) {
                window.$crisp.push(["set", "user:nickname", [user.nickname]]);
              }
              window.sessionStorage.setItem('crisp_sync_lock', currentEmail);
            }
          }
        } else if (lastEmail) {
          // 退出登录时重置
          window.$crisp.push(["do", "session:reset"]);
          window.sessionStorage.removeItem('crisp_sync_lock');
        }

        // 4. 【关键】手动同步实时路径
        // 既然 Crisp 无法自动检测 SPA 路径，我们就手动推给它
        if (window.$crisp) {
          window.$crisp.push(["set", "session:data", [[["last_path", window.location.pathname]]]]);
        }
      } catch (e) {
        console.error("Crisp Sync Error", e);
      }
    };

    // 初始化执行
    handleCrispLogic();

    // 监听 URL 变化（解决实时显示浏览页面的问题）
    const pushState = window.history.pushState;
    window.history.pushState = function() {
      // @ts-ignore
      pushState.apply(window.history, arguments);
      handleCrispLogic(); // 路径一变，立刻同步给 Crisp
    };

    // 开启高频同步（针对多窗口或异步数据）
    const timer = setInterval(handleCrispLogic, 3000);

    return () => clearInterval(timer);
  }, []);
  // --- 【监控中心结束】 ---

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
      </ThemeCustomization>
    </CacheProvider>
  );
};

export default App;
