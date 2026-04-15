import { useEffect, useRef } from "react";
import lo from "lodash-es";
import { useDispatch, useSelector } from "@/store";
import { useGetUserInfoQuery } from "@/store/services/api";
import { logout } from "@/store/reducers/auth";

const useAuthStateDetector = () => {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.auth.isLoggedIn);
  const { data: userData, error } = useGetUserInfoQuery(undefined, {
    skip: !isLogin
  });

  // 使用 Ref 记录，防止在同一个 session 内重复触发绑定
  const lastSyncedRef = useRef<string | null>(window.sessionStorage.getItem('crisp_synced_email'));

  useEffect(() => {
    if (window.$crisp) {
      if (isLogin && userData) {
        const email = userData.email || (userData as any).data?.email;
        const nickname = userData.nickname || (userData as any).data?.nickname;

        if (email && email !== lastSyncedRef.current) {
          // 发现账号变更（或首次登录）：重置并绑定
          window.$crisp.push(["do", "session:reset"]);
          window.$crisp.push(["set", "user:email", [email]]);
          if (nickname) {
            window.$crisp.push(["set", "user:nickname", [nickname]]);
          }
          
          // 同步到缓存和 Ref
          window.sessionStorage.setItem('crisp_synced_email', email);
          lastSyncedRef.current = email;
          console.log("✅ Crisp 身份已锁定:", email);
        }
      } else if (!isLogin && lastSyncedRef.current) {
        // 退出登录：清理 Crisp 状态
        window.$crisp.push(["do", "session:reset"]);
        window.sessionStorage.removeItem('crisp_synced_email');
        lastSyncedRef.current = null;
        console.log("ℹ️ Crisp 已重置为匿名状态");
      }
    }
  }, [isLogin, userData]);

  useEffect(() => {
    if (!lo.isEmpty(error) && (error as any).status === 401) {
      dispatch(logout());
    }
  }, [error, dispatch]);

  return isLogin;
};

export default useAuthStateDetector;
