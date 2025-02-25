import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Crisp Chat Integration
window.$crisp = [];
window.CRISP_WEBSITE_ID = "0d31a6be-2276-432f-bd47-ac8d962e84ae";
(function () {
  const d = document;
  const s = d.createElement("script");
  s.src = "https://client.crisp.chat/l.js";
  s.async = 1;
  d.getElementsByTagName("head")[0].appendChild(s);
})();

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

// 如果需要在用户登录后设置用户信息，可以在此处添加代码
// 示例：
// const userEmail = "user@example.com"; // 替换为实际用户的邮箱
// if (window.$crisp) {
//   window.$crisp.push(["set", "user", { email: userEmail }]);
// }

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
