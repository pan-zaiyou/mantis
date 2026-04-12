import { useEffect } from "react";
import lo from "lodash-es";

// project imports
import { useDispatch, useSelector } from "@/store";
import { useGetUserInfoQuery } from "@/store/services/api";
import { logout } from "@/store/reducers/auth";

const useAuthStateDetector = () => {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.auth.isLoggedIn);

  const { data, error } = useGetUserInfoQuery(undefined, {
    skip: !isLogin
  });

  // ❗ 原本逻辑（保持不变）
  useEffect(() => {
    if (!lo.isEmpty(error)) {
      console.error(error);

      if (lo.isNumber((error as any).status)) {
        switch ((error as any).status) {
          case 401:
          case 403:
            dispatch(logout());
        }
      }
    }
  }, [error, dispatch]);

  // ✅ 延迟加载 Crisp（无 visitor 版本）
  useEffect(() => {
    const user = data?.data;

    // ❌ 没登录直接不加载 Crisp
    if (!user?.email) return;

    // ❗ 防止重复加载
    if ((window as any).CRISP_LOADED) return;

    // 标记已加载
    (window as any).CRISP_LOADED = true;

    // 初始化 Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "0d31a6be-2276-432f-bd47-ac8d962e84ae";

    // 加载 Crisp 脚本
    const d = document;
    const s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    d.getElementsByTagName("head")[0].appendChild(s);

    // 等待加载完成后绑定用户
    const bindUser = () => {
      if (window.$crisp) {
        window.$crisp.push(["set", "user:email", [user.email]]);
        window.$crisp.push(["set", "user:nickname", [user.email]]);
      } else {
        setTimeout(bindUser, 300);
      }
    };

    bindUser();
  }, [data]);

  return isLogin;
};

export default useAuthStateDetector;
