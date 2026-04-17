import { useEffect, useRef } from "react";
import lo from "lodash-es";

// project imports
import { useDispatch, useSelector } from "@/store";
import { useGetUserInfoQuery } from "@/store/services/api";
import { logout } from "@/store/reducers/auth";

const useAuthStateDetector = () => {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.auth.isLoggedIn);
  
  const { data: userData, error } = useGetUserInfoQuery(undefined, {
    skip: !isLogin
  });

  const lastSyncedRef = useRef<string | null>(
    window.sessionStorage.getItem('crisp_synced_email')
  );

  useEffect(() => {
    if (!window.$crisp) return;

    if (isLogin && userData) {
      const email = userData.email || (userData as any).data?.email;
      const nickname = userData.nickname || (userData as any).data?.nickname;

      if (email && email !== lastSyncedRef.current) {
        // 有旧账号绑定时才先重置，首次登录直接绑定
        if (lastSyncedRef.current !== null) {
          window.$crisp.push(["do", "session:reset"]);
        }

        window.$crisp.push(["set", "user:email", [email]]);

        if (nickname) {
          window.$crisp.push(["set", "user:nickname", [nickname]]);
        }

        window.sessionStorage.setItem('crisp_synced_email', email);
        lastSyncedRef.current = email;

        console.log("✅ [Crisp] 身份绑定成功:", email);
      }
    } else if (!isLogin && lastSyncedRef.current) {
      window.$crisp.push(["do", "session:reset"]);
      window.sessionStorage.removeItem('crisp_synced_email');
      lastSyncedRef.current = null;

      console.log("ℹ️ [Crisp] 用户登出，会话已清理");
    }
  }, [isLogin, userData]);

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

  return isLogin;
};

export default useAuthStateDetector;
