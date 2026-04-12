import { useEffect } from "react";
import lo from "lodash-es";

// project imports
import { useDispatch, useSelector } from "@/store";
import { useGetUserInfoQuery } from "@/store/services/api";
import { logout } from "@/store/reducers/auth";

const useAuthStateDetector = () => {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.auth.isLoggedIn);

  // ✅ 这里加 data
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

  // ✅ 新增：绑定 Crisp 用户信息
  useEffect(() => {
    const user = data?.data;

    if (window.$crisp && user?.email) {
      window.$crisp.push(["set", "user:email", [user.email]]);
      window.$crisp.push(["set", "user:nickname", [user.email]]);
    }
  }, [data]);

  return isLogin;
};

export default useAuthStateDetector;
