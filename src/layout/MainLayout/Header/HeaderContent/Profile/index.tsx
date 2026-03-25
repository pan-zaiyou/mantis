import { useState } from "react";
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
  const [avatar] = useState<string>(
    // 固定头像 URL，不再动态生成
    `https://avatarai.example.com/api/avatar?seed=default@user.com&style=memojis&background=gradient&expressions=true&hair=true`
  );

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <Box>
      <ButtonBase aria-label="open profile">
        <Stack direction="row" spacing={2}>
          {/* 固定头像 */}
          <Avatar alt="profile user" src={avatar} size="xs" />
          {isMobile || <Typography variant="subtitle1">{user?.email}</Typography>}
        </Stack>
      </ButtonBase>
    </Box>
  );
};

export default Profile;
