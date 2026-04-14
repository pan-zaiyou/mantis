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

  // --- 【全套模仿 kycc：身份驱动加载逻辑】 ---
  useEffect(() => {
    const syncCrisp = () => {
      try {
        // 1. 获取用户信息
        const rawUser = localStorage.getItem('user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const email = user?.email || user?.data?.email || null;

        // 【核心逻辑 A】：检测到登录，但脚本还没加载
        if (email && !(window as any).__CRISP_LOADED) {
          console.log("🛠️ 正在模仿 kycc 逻辑：预埋身份并启动 Crisp...");
          
          // 在脚本加载前，先塞入身份信息。这样脚本一出生就是会员身份。
          window.$crisp.push(["set", "user:email", [email]]);
          if (user.nickname) {
            window.$crisp.push(["set", "user:nickname", [user.nickname]]);
          }

          // 动态注入脚本（手动唤醒）
          const d = document;
          const s = d.createElement("script");
          s.src = "https://client.crisp.chat/l.js";
          s.async = true;
          d.getElementsByTagName("head")[0].appendChild(s);
          
          (window as any).__CRISP_LOADED = true;
          (window as any).__LAST_EMAIL = email;
        } 
        
        // 【核心逻辑 B】：换号检测（解决多账号并存/对话残留）
        else if (email && (window as any).__LAST_EMAIL && email !== (window as any).__LAST_EMAIL) {
          console.log("🔄 检测到账号切换，正在强制重置对话...");
          window.$crisp.push(["do", "session:reset"]);
          window.$crisp.push(["set", "user:email", [email]]);
          (window as any).__LAST_EMAIL = email;
        }

        // 【核心逻辑 C】：解决路径不实时显示的问题
        // 既然 SPA 切换不触发 Crisp 自动感应，我们就每 2 秒手动推一次路径
        if (window.$crisp && (window as any).__CRISP_LOADED) {
          window.$crisp.push(["set", "session:data", [[
            ["current_path", window.location.pathname],
            ["page_title", document.title]
          ]]]);
        }
      } catch (e) {
        console.error("Crisp Sync Error:", e);
      }
    };

    // 启动监听器（2秒同步一次，确保 100% 对齐）
    syncCrisp();
    const timer = setInterval(syncCrisp, 2000);

    return () => clearInterval(timer);
  }, []);
  // --- 【逻辑结束】 ---

  return (
    <CacheProvider value={cache}>
      <ThemeCustomization>
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
      </ThemeCustomization>
    </CacheProvider>
  );
};

export default App;
