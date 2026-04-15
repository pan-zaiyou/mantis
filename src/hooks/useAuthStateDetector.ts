import { useEffect } from "react";
import lo from "lodash-es";

// project imports
import { useDispatch, useSelector } from "@/store";
import { useGetUserInfoQuery } from "@/store/services/api";
import { logout } from "@/store/reducers/auth";

const useAuthStateDetector = () => {
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.auth.isLoggedIn);
  
  // 获取当前登录用户的数据
  const { data: userData, error } = useGetUserInfoQuery(undefined, {
    skip: !isLogin
  });

  // --- 【Crisp 身份同步补丁】 ---
  useEffect(() => {
    if (window.$crisp) {
      if (isLogin && userData) {
        // 情况 A：用户已登录
        const email = userData.email || (userData as any).data?.email;
        const nickname = userData.nickname || (userData as any).data?.nickname;
        
        // 检查当前会话锁定的邮箱
        const syncedEmail = window.sessionStorage.getItem('crisp_synced_email');

        if (email && email !== syncedEmail) {
          // 核心逻辑：如果账号变了，先重置旧会话，再绑定新身份
          window.$crisp.push(["do", "session:reset"]);
          window.$crisp.push(["set", "user:email", [email]]);
          if (nickname) {
            window.$crisp.push(["set", "user:nickname", [nickname]]);
          }
          window.sessionStorage.setItem('crisp_synced_email', email);
          console.log("✅ Crisp 身份同步成功:", email);
        }
      } else if (!isLogin) {
        // 情况 B：用户退出登录
        const syncedEmail = window.sessionStorage.getItem('crisp_synced_email');
        if (syncedEmail) {
          window.$crisp.push(["do", "session:reset"]);
          window.sessionStorage.removeItem('crisp_synced_email');
          console.log("ℹ️ 用户退出，Crisp 会话已清理");
        }
      }
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
