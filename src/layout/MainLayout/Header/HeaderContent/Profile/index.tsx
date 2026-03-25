import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Box,
  ButtonBase,
  Stack,
  Typography,
  useMediaQuery
} from "@mui/material";

// project import
import Avatar from "@/components/@extended/Avatar";
import { useGetUserInfoQuery } from "@/store/services/api";

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

const Profile = () => {
  const { data: user } = useGetUserInfoQuery();
  const [avatar, setAvatar] = useState<string>("");

  useEffect(() => {
    // 生成随机头像的函数
    const generateAvatar = () => {
      const seed = user?.email || "default@user.com";
      const randomSeed = `${seed}-${Math.random()}`; // 基于随机数生成头像
      return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(
        randomSeed
      )}&backgroundType=gradientLinear&radius=50`;
    };

    // 设置初始头像
    setAvatar(generateAvatar());
  }, [user?.email]); // 当用户邮箱改变时更新头像

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <Box>
      <ButtonBase aria-label="open profile">
        <Stack direction="row" spacing={2}>
          {/* 头像：只会渲染一次，之后不会再变化 */}
          <Avatar alt="profile user" src={avatar} size="xs" />
          {isMobile || <Typography variant="subtitle1">{user?.email}</Typography>}
        </Stack>
      </ButtonBase>
    </Box>
  );
};

export default Profile;
