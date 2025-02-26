import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux"; // 如果你使用 Redux

// third-party
import { Provider as ReduxProvider } from "react-redux";
import "react-app-polyfill/ie11";
import "core-js/stable";

// apex-chart
import "@/assets/third-party/apex-chart.css";
import "@/assets/third-party/react-table.css";

// resize observer
import ResizeObserver from "resize-observer-polyfill";

// project import
import App from "@/App";
import store from "@/store";
import { ConfigProvider } from "@/contexts/ConfigContext";
import "@/analytics";

import "@fontsource/roboto";
import "simplebar-react/dist/simplebar.min.css";

// 假设通过 Redux 获取当前用户邮箱
const getCurrentUserEmail = () => {
  const user = useSelector((state: any) => state.user); // 获取 Redux store 中的用户信息
  console.log("Current user:", user);  // 打印用户对象
  return user ? user.email : null;  // 返回用户邮箱
};

// Crisp 集成代码
window.$crisp = [];
window.CRISP_WEBSITE_ID = "your_website_id";  // 替换为你的 Crisp 网站 ID

(function() {
  var d = document;
  var s = d.createElement("script");
  s.src = "https://client.crisp.chat/l.js";
  s.async = 1;
  s.onload = function() {
    console.log("Crisp script loaded successfully");

    // 获取邮箱
    const email = getCurrentUserEmail();
    console.log("Current user email:", email);  // 打印邮箱，检查是否正确

    // 只有在邮箱存在时才调用 Crisp API 设置用户信息
    if (email) {
      window.$crisp.push(["set", "user:email", email]);
      console.log(`User email set: ${email}`);
    } else {
      console.log("User email is not available.");
    }
  };
  d.getElementsByTagName("head")[0].appendChild(s);
})();

// hash router change to browser router
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

// ==============================|| MAIN - REACT DOM RENDER  ||============================== //

root.render(
  <ReduxProvider store={store}>
    <ConfigProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </ReduxProvider>
);
