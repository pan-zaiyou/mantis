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

  // --- 【Crisp 智能大脑：解决路径不显示 & 多账号切换】 ---
  useEffect(() => {
    const handleCrispSync = () => {
      try {
        const rawUser = localStorage.getItem('user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const currentEmail = user?.email || user?.data?.email || null;

        // 获取已同步的“身份锁”
        const lastSyncedEmail = window.sessionStorage.getItem('crisp_identity_lock');

        if (window.$crisp) {
          // 逻辑 1：如果检测到新登录，或账号更换
          if (currentEmail && currentEmail !== lastSyncedEmail) {
            // 关键动作：重置会话并绑定新邮箱，防止出现 visitor45 这种影子
            window.$crisp.push(["do", "session:reset"]);
            window.$crisp.push(["set", "user:email", [currentEmail]]);
            if (user.nickname) {
              window.$crisp.push(["set", "user:nickname", [user.nickname]]);
            }
            window.sessionStorage.setItem('crisp_identity_lock', currentEmail);
            console.log("✅ Crisp 身份已切换至:", currentEmail);
          }

          // 逻辑 2：如果用户退出了
          if (!currentEmail && lastSyncedEmail) {
            window.$crisp.push(["do", "session:reset"]);
            window.sessionStorage.removeItem('crisp_identity_lock');
            console.log("ℹ️ 用户已登出，重置 Crisp 会话");
          }

          // 逻辑 3：解决实时显示浏览页面的问题（路径补丁）
          // 强制向 Crisp 后台推送当前页面信息
          window.$crisp.push(["set", "session:data", [[
            ["last_path", window.location.pathname],
            ["page_name", document.title || "仪表盘"]
          ]]]);
        }
      } catch (e) {
        // 静默处理错误
      }
    };

    // 1. 初始化执行
    handleCrispSync();

    // 2. 每 2.5 秒扫描一次状态（解决 SPA 路由跳转不更新的问题）
    const interval = setInterval(handleCrispSync, 2500);

    return () => clearInterval(interval);
  }, []);
  // --- 【智能大脑结束】 ---

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
