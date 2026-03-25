import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Box,
  ButtonBase,
  CardContent,
  ClickAwayListener,
  Divider,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery
} from "@mui/material";

// 项目组件
import Avatar from "@/components/@extended/Avatar";
import MainCard from "@/components/MainCard";
import Transitions from "@/components/@extended/Transitions";
import MenuList from "./MenuList";
import { useGetUserInfoQuery } from "@/store/services/api";
import { makeStyles } from "@/themes/hooks";

// ==============================|| 头部内容 - 个人资料 ||============================== //

const useStyles = makeStyles<{ open: boolean }>({
  name: "profile"
})((theme, { open }) => ({
  root: { flexShrink: 0 },
  button: {
    padding: theme.spacing(0.25),
    backgroundColor: open ? theme.palette.grey[300] : "transparent",
    ["@media (prefers-color-scheme: dark)"]: {
      backgroundColor: open ? theme.palette.grey[200] : "transparent"
    },
    borderRadius: theme.shape.borderRadius,
    "&:hover": {
      backgroundColor: theme.palette.mode === "dark" ? theme.palette.secondary.light : theme.palette.secondary.lighter
    },
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.secondary.dark}`,
      outlineOffset: 2
    }
  },
  userInfo: {
    alignItems: "center",
    padding: theme.spacing(0.5)
  },
  paper: {
    boxShadow: theme.customShadows.z1,
    width: 280,
    minWidth: 240,
    maxWidth: 280,
    [theme.breakpoints.down("md")]: {
      maxWidth: 250
    }
  },
  cardContent: {
    padding: theme.spacing(1.5, 2, 2)
  },
  userAvatar: { width: theme.spacing(4), height: theme.spacing(4) },
  avatarStack: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "nowrap"
  },
  infoStack: {
    maxWidth: `calc(100% - ${theme.spacing(5)})`
  }
}));

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  const { data: user } = useGetUserInfoQuery();

  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const { classes } = useStyles({ open });

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  // ==================== 获取头像逻辑 ==================== //

  const seed = user?.email || "user";

  // 判断是否是QQ邮箱
  const isQQEmail = user?.email?.toLowerCase().includes("@qq.com");

  // 获取QQ号（即邮箱的前缀部分）
  const qqNumber = user?.email?.split("@")[0];

  // 如果是QQ邮箱，使用QQ头像，否则使用生成的头像
  const avatar = isQQEmail && qqNumber
    ? `https://q1.qlogo.cn/g?b=qq&k=${qqNumber}&s=640` // 获取QQ邮箱头像
    : `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&radius=50`; // 使用 DiceBear 生成的头像

  // ==================== UI ==================== //

  return (
    <Box className={classes.root}>
      <ButtonBase
        className={classes.button}
        ref={anchorRef}
        aria-label="open profile"
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Stack direction="row" spacing={2} className={classes.userInfo}>
          {/* ✅ 右上角头像 */}
          <Avatar
            alt="profile user"
            src={avatar}
            size="xs"
            onError={(e: any) => {
              e.target.src = avatar; // 如果头像加载失败，使用默认头像
            }}
          />
          {isMobile || <Typography variant="subtitle1">{user?.email}</Typography>}
        </Stack>
      </ButtonBase>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={"menu"}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper className={classes.paper}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <CardContent className={classes.cardContent}>
                    <Stack direction={"row"} className={classes.avatarStack} spacing={1}>
                      {/* ✅ 弹窗头像 */}
                      <Avatar
                        alt="profile user"
                        src={avatar}
                        className={classes.userAvatar}
                        onError={(e: any) => {
                          e.target.src = avatar; // 如果头像加载失败，使用默认头像
                        }}
                      />
                      <Stack className={classes.infoStack}>
                        <Typography variant="h6" noWrap>
                          {user?.email}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t("layout.header.profile.user_secondary")}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                  <Divider />
                  {open && <MenuList />}
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Profile;
