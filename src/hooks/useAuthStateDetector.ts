import { useEffect } from "react";
import { useDispatch, useSelector } from "@/store";
import { useGetUserInfoQuery } from "@/store/services/api";
import { logout } from "@/store/reducers/auth";

let crispBound = false; // 全局锁，保证只绑定一次邮箱

const useAuthStateDetector = () => {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.auth.isLoggedIn);

  const { data, error } = useGetUserInfoQuery(undefined, {
    skip: !isLogin
  });

  // 处理401/403错误
  useEffect(() => {
    if (error) {
      console.error(error);
      if (error.status === 401 || error.status === 403) {
        dispatch(logout());
      }
    }
  }, [error, dispatch]);

  // 绑定 Crisp 用户邮箱
  useEffect(() => {
    const user = data?.data;
    if (!user?.email) return;
    if (crispBound) return;

    const timer = setInterval(() => {
      if (window.$crisp) {
        window.$crisp.push(["set", "user:email", [user.email]]);
        window.$crisp.push(["set", "user:nickname", [user.email]]);
        crispBound = true;
        clearInterval(timer);
      }
    }, 300);

    return () => clearInterval(timer);
  }, [data]);

  return isLogin;
};

export default useAuthStateDetector;
