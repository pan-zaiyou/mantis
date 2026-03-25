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
    // 使用 AvatarAI 或类似服务生成头像
    const generateAvatar = () => {
      const seed = user?.email || "default@user.com";
      const generatedAvatar = `https://avatarai.example.com/api/avatar?seed=${encodeURIComponent(
        seed
      )}&style=memojis&background=gradient&expressions=true&hair=true`;

      return generatedAvatar;
    };

    // 设置初始头像（确保头像固定）
    setAvatar(generateAvatar());
  }, [user?.email]); // 当用户邮箱改变时更新头像

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <Box>
      <ButtonBase aria-label="open profile">
        <Stack direction="row" spacing={2}>
          {/* 头像：固定头像，不会刷新变化 */}
          <Avatar alt="profile user" src={avatar} size="xs" />
          {isMobile || <Typography variant="subtitle1">{user?.email}</Typography>}
        </Stack>
      </ButtonBase>
    </Box>
  );
};

export default Profile;
