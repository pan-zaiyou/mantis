import { useEffect, useRef } from "react";
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

  // ✅ 防止重复执行
  const hasBindCrisp = useRef(false);

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

  // ✅ 绑定 Crisp（修复版）
  useEffect(() => {
    const user = data?.data;

    if (!user?.email) return;

    // ❗ 关键：只执行一次
    if (hasBindCrisp.current) return;

    const bindCrisp = () => {
      if (window.$crisp) {
        // 🔥 只 reset 一次
        window.$crisp.push(["do", "session:reset"]);

        // 绑定用户
        window.$crisp.push(["set", "user:email", [user.email]]);
        window.$crisp.push(["set", "user:nickname", [user.email]]);

        // 标记已执行
        hasBindCrisp.current = true;
      } else {
        setTimeout(bindCrisp, 300);
      }
    };

    bindCrisp();
  }, [data]);

  return isLogin;
};

export default useAuthStateDetector;
