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

  const hasBindCrisp = useRef(false);

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

  // ✅ 不再 reset
  useEffect(() => {
    const user = data?.data;

    if (!user?.email) return;
    if (hasBindCrisp.current) return;

    const bindCrisp = () => {
      if (window.$crisp) {
        // ✅ 直接覆盖 visitor
        window.$crisp.push(["set", "user:email", [user.email]]);
        window.$crisp.push(["set", "user:nickname", [user.email]]);

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
