import React, { useEffect } from "react"; // 1. 引入 useEffect

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

  usePageAnalyticsEffect();
  useAuthStateDetector();
  useHtmlLangSelector();
  useTitle(null);

  // --- 【新增：Crisp 身份深度同步逻辑】 ---
  useEffect(() => {
    const syncCrispIdentity = () => {
      try {
        // 从 Mantis 的标准路径获取用户信息
        const rawUser = localStorage.getItem('user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const currentEmail = user?.email || user?.data?.email || null;

        // 获取当前 Session 已同步的邮箱（防止陷入重复刷新的死循环）
        const syncedEmail = window.sessionStorage.getItem('last_crisp_synced_email');

        if (currentEmail) {
          // 场景：检测到新登录，或当前 Crisp 身份与登录账号不一致
          if (currentEmail !== syncedEmail) {
            if (window.$crisp) {
              // 核心动作：重置旧会话 -> 绑定新邮箱
              window.$crisp.push(["do", "session:reset"]);
              window.$crisp.push(["set", "user:email", [currentEmail]]);
              if (user.nickname) {
                window.$crisp.push(["set", "user:nickname", [user.nickname]]);
              }
              // 记录已同步状态
              window.sessionStorage.setItem('last_crisp_synced_email', currentEmail);
              console.log('✅ Crisp 身份已强制同步:', currentEmail);
            }
          }
        } else {
          // 场景：检测到用户已登出，立即重置 Crisp 防止身份残留
          if (syncedEmail && window.$crisp) {
            window.$crisp.push(["do", "session:reset"]);
            window.sessionStorage.removeItem('last_crisp_synced_email');
            console.log('ℹ️ 用户已退出，已清理 Crisp 会话');
          }
        }
      } catch (e) {
        console.error("Crisp Sync Failure:", e);
      }
    };

    // 1. App 挂载时执行一次
    syncCrispIdentity();

    // 2. 开启高频探测器（3秒/次），解决 SPA 页面跳转不刷新的问题
    const crispInterval = setInterval(syncCrispIdentity, 3000);

    return () => clearInterval(crispInterval);
  }, []);
  // --- 【逻辑结束】 ---

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
