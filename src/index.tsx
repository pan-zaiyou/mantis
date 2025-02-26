import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import "react-app-polyfill/ie11";
import "core-js/stable";
import "@/assets/third-party/apex-chart.css";
import "@/assets/third-party/react-table.css";
import ResizeObserver from "resize-observer-polyfill";
import App from "@/App";
import store from "@/store";
import { ConfigProvider } from "@/contexts/ConfigContext";
import "@/analytics";
import "@fontsource/roboto";
import "simplebar-react/dist/simplebar.min.css";

// Crisp 初始化代码
if (!window.$crisp) {
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = "0d31a6be-2276-432f-bd47-ac8d962e84ae";

  (function () {
    const d = document, s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    d.getElementsByTagName("head")[0].appendChild(s);
  })();
}

// 更新 Crisp 用户信息
const updateCrispUserInfo = (userInfo: { email?: string }) => {
  if (window.$crisp && userInfo?.email) {
    window.$crisp.push(["set", "user:email", userInfo.email]);
  }
};

// 定期检查用户信息并更新 Crisp
const checkUserInfo = () => {
  let userInfo = localStorage.getItem("userInfo");
  userInfo = userInfo ? JSON.parse(userInfo) : null;

  if (userInfo && userInfo.email) {
    updateCrispUserInfo(userInfo);
  } else {
    setTimeout(checkUserInfo, 1000);
  }
};

// 延迟 2 秒检查用户信息
setTimeout(checkUserInfo, 2000);

// 处理 Hash 路由
if (window.location.hash && window.location.pathname === "/") {
  window.location.href = new URL(window.location.hash, window.location.href).href;
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("root element not found");
}

const root = createRoot(container!);

const ro = new ResizeObserver((entries, observer) =>
  entries.forEach((entry) => {
    const { width, height } = entry.contentRect;
    document.documentElement.style.setProperty("--width", `${width}px`);
    document.documentElement.style.setProperty("--height", `${height}px`);
    observer.observe(entry.target);
  })
);

ro.observe(container);

// 渲染 React 组件
root.render(
  <ReduxProvider store={store}>
    <ConfigProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </ReduxProvider>
);
