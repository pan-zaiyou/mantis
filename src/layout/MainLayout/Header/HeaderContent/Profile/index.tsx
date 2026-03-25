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
  useMediaQuery,
  Skeleton
} from "@mui/material";

// project import
import Avatar from "@/components/@extended/Avatar";
import MainCard from "@/components/MainCard";
import Transitions from "@/components/@extended/Transitions";
import MenuList from "./MenuList";
import { useGetUserInfoQuery } from "@/store/services/api";
import { makeStyles } from "@/themes/hooks";

// ==============================|| HOOK - AVATAR ||============================== //

const useAvatar = (email?: string) => {
  const seedRef = useRef("default");

  // 只在第一次拿到 email 时更新 seed，避免闪烁
  if (email && seedRef.current === "default") {
    seedRef.current = email;
  }

  const seed = seedRef.current;

  return `https://api.dicebear.com/7.x/lorelei/png?seed=${encodeURIComponent(
    seed
  )}&radius=50&backgroundColor=0b1a2b,1b263b,415a77`;
};

// ==============================|| STYLES ||============================== //

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
      backgroundColor:
        theme.palette.mode === "dark"
          ? theme.palette.secondary.light
          : theme.palette.secondary.lighter
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

// ==============================|| COMPONENT ||============================== //

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();

  const { data: user, isLoading } = useGetUserInfoQuery();

  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const { classes } = useStyles({ open });

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleClose = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  // ✅ 使用优化后的头像 hook
  const generatedAvatar = useAvatar(user?.email);

  // ✅ 未来可扩展：优先使用后端头像
  const avatar = user?.avatar_url || generatedAvatar;

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
          {/* 头像 */}
          {isLoading ? (
            <Skeleton variant="circular" width={32} height={32} />
          ) : (
            <Avatar
              alt="profile user"
              src={avatar}
              size="xs"
              onError={(e: any) => {
                e.target.src = generatedAvatar;
              }}
            />
          )}

          {/* 邮箱 */}
          {!isMobile &&
            (isLoading ? (
              <Skeleton width={120} height={20} />
            ) : (
              <Typography variant="subtitle1">{user?.email}</Typography>
            ))}
        </Stack>
      </ButtonBase>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role="menu"
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: "offset", options: { offset: [0, 9] } }]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper className={classes.paper}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard elevation={0} border={false} content={false}>
                  <CardContent className={classes.cardContent}>
                    <Stack direction="row" className={classes.avatarStack} spacing={1}>
                      {/* 弹窗头像 */}
                      {isLoading ? (
                        <Skeleton variant="circular" width={40} height={40} />
                      ) : (
                        <Avatar
                          alt="profile user"
                          src={avatar}
                          className={classes.userAvatar}
                          onError={(e: any) => {
                            e.target.src = generatedAvatar;
                          }}
                        />
                      )}

                      <Stack className={classes.infoStack}>
                        {isLoading ? (
                          <Skeleton width={140} height={20} />
                        ) : (
                          <Typography variant="h6" noWrap>
                            {user?.email}
                          </Typography>
                        )}

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
