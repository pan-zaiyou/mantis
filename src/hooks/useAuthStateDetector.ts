import { useEffect, useRef } from "react";
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

  // 使用 useRef 记录当前已经同步过的 Email，防止在 React 渲染过程中重复触发
  // 初始值尝试从本地存储读取，确保刷新后依然能对齐
  const lastSyncedRef = useRef<string | null>(window.sessionStorage.getItem('crisp_synced_email'));

  useEffect(() => {
    if (window.$crisp) {
      if (isLogin && userData) {
        // 获取最新的 Email 数据
        const email = userData.email || (userData as any).data?.email;
        const nickname = userData.nickname || (userData as any).data?.nickname;

        if (email && email !== lastSyncedRef.current) {
          // 核心逻辑：只有账号真正变化（或首次登录）时，才执行物理重置
          // 这能防止你看到的“先产生多个、后合并”的闪现现象
          window.$crisp.push(["do", "session:reset"]);
          window.$crisp.push(["set", "user:email", [email]]);
          
          if (nickname) {
            window.$crisp.push(["set", "user:nickname", [nickname]]);
          }

          // 将已绑定的 Email 同步到本地缓存和 Ref 中
          window.sessionStorage.setItem('crisp_synced_email', email);
          lastSyncedRef.current = email;
          
          console.log("✅ [Crisp] 身份已强制对齐:", email);
        }
      } else if (!isLogin && lastSyncedRef.current) {
        // 如果用户执行了登出操作，物理重置会话并清除缓存标记
        window.$crisp.push(["do", "session:reset"]);
        window.sessionStorage.removeItem('crisp_synced_email');
        lastSyncedRef.current = null;
        
        console.log("ℹ️ [Crisp] 用户登出，会话已清理");
      }
    }
  }, [isLogin, userData]);

  // 错误处理逻辑保持不变
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
