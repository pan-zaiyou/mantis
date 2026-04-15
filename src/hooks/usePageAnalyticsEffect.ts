import { useEffect } from "react";

// third-party
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

// project imports
import { useSelector } from "@/store";
import { useGetUserInfoQuery } from "@/store/services/api";

const usePageAnalyticsEffect = () => {
  const location = useLocation();

  useEffect(() => {
    const fullPath = location.pathname + location.search;

    // 1. 原有的 Google Analytics 统计逻辑
    ReactGA.send({
      hitType: "pageview",
      page: fullPath
    });

    // 2. 【核心补丁】实时同步路径给 Crisp
    // 这样当用户在菜单间点击时，Crisp 后台会立即显示“正在浏览：/订阅中心”
    if (window.$crisp) {
      window.$crisp.push(["set", "session:data", [[
        ["current_path", fullPath],
        ["last_browse_time", new Date().toLocaleString()]
      ]]]);
    }
    
    // 调试日志（上线后可删除）
    console.log("Crisp Path Synced:", fullPath);
  }, [location]);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const { data: userData } = useGetUserInfoQuery(undefined, {
    skip: !isLoggedIn
  });

  useEffect(() => {
    // 3. 用户身份二次对齐（兜底逻辑）
    if (userData?.email) {
      ReactGA.set({
        userEmail: userData.email
      });

      if (window.$crisp) {
        window.$crisp.push(["set", "user:email", [userData.email]]);
        if (userData.nickname) {
          window.$crisp.push(["set", "user:nickname", [userData.nickname]]);
        }
      }
    }
  }, [userData]);
};

export default usePageAnalyticsEffect;
