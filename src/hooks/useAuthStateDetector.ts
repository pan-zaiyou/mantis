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

  // ✅ 关键：稳定绑定 Crisp 用户
  useEffect(() => {
    const user = data?.data;

    if (!user?.email) return;

    // 封装一个重试函数（确保 Crisp 已加载）
    const bindCrisp = () => {
      if (window.$crisp) {
        // 🔥 重置会话（避免 visitor 残留）
        window.$crisp.push(["do", "session:reset"]);

        // 绑定用户信息
        window.$crisp.push(["set", "user:email", [user.email]]);
        window.$crisp.push(["set", "user:nickname", [user.email]]);
      } else {
        // 如果 Crisp 还没加载，等待再试
        setTimeout(bindCrisp, 500);
      }
    };

    bindCrisp();
  }, [data]);

  return isLogin;
};

export default useAuthStateDetector;
