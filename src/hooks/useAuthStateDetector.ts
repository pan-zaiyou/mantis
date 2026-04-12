import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "@/store";
import { useGetUserInfoQuery } from "@/store/services/api";
import { logout } from "@/store/reducers/auth";

const useAuthStateDetector = () => {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.auth.isLoggedIn);
  const { data, error } = useGetUserInfoQuery(undefined, { skip: !isLogin });

  const hasBindUser = useRef(false);

  // 错误处理逻辑
  useEffect(() => {
    if (error) {
      console.error(error);
      if (error.status === 401 || error.status === 403) {
        dispatch(logout());
      }
    }
  }, [error, dispatch]);

  // 绑定已登录用户邮箱
  useEffect(() => {
    const user = data?.data;
    if (!user?.email) return;
    if (hasBindUser.current) return;

    hasBindUser.current = true;

    const bindUser = () => {
      if (window.$crisp) {
        // 覆盖 visitor，显示邮箱
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
