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
    // 1. Google Analytics 统计
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search
    });

    // 2. 【Crisp 路径同步补丁】
    if (window.$crisp) {
      // 强制向后台推送当前页面的位置和标题
      window.$crisp.push(["set", "session:data", [[
        ["current_path", location.pathname + location.search],
        ["page_title", document.title || "V2B Dashboard"]
      ]]]);
    }
  }, [location]);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const { data: userData } = useGetUserInfoQuery(undefined, {
    skip: !isLoggedIn
  });

  useEffect(() => {
    ReactGA.set({
      userEmail: userData?.email
    });

    // 确保用户信息对齐
    if (window.$crisp && userData?.email) {
      window.$crisp.push(["set", "user:email", [userData.email]]);
    }
  }, [userData]);
};

export default usePageAnalyticsEffect;
