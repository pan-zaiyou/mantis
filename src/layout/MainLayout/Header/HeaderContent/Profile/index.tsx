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

// project import
import Avatar from "@/components/@extended/Avatar";
import MainCard from "@/components/MainCard";
import Transitions from "@/components/@extended/Transitions";
import MenuList from "./MenuList";
import { useGetUserInfoQuery } from "@/store/services/api";
import { makeStyles } from "@/themes/hooks";

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

  // ==================== 核心头像 ==================== //

  const seed = user?.email || "U";

  // 生成稳定颜色（模拟 Apple 风）
  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444"
  ];

  const colorIndex = seed.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  // 取首字母
  const letter = seed.charAt(0).toUpperCase();

  // ==================== UI ==================== //

  return (
    <Box className={classes.root}>
      <ButtonBase
        className={classes.button}
        ref={anchorRef}
        onClick={handleToggle}
      >
        <Stack direction="row" spacing={2} className={classes.userInfo}>
          {/* ✅ 右上角头像（彻底不会失败） */}
          <Avatar
            size="xs"
            sx={{
              backgroundColor: bgColor,
              color: "#fff",
              fontWeight: 600
            }}
          >
            {letter}
          </Avatar>

          {isMobile || <Typography variant="subtitle1">{user?.email}</Typography>}
        </Stack>
      </ButtonBase>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        transition
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
                        className={classes.userAvatar}
                        sx={{
                          backgroundColor: bgColor,
                          color: "#fff",
                          fontWeight: 600
                        }}
                      >
                        {letter}
                      </Avatar>

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
