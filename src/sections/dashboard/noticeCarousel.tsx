import React, { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

// material-ui
import {
  Box,
  ButtonBase,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle as MuiDialogTitle,
  Typography,
  useMediaQuery,
  IconButton,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import Carousel from "react-material-ui-carousel";

// project imports
import { useGetNoticesQuery } from "@/store/services/api";
import { makeStyles } from "@/themes/hooks";

// assets
import defaultBackgroundImage from "@/assets/images/announcement_background.svg";
import Notice from "@/model/notice";
import MuiMarkdown from "mui-markdown";
import { useTheme } from "@mui/material/styles";
import ReactGA from "react-ga4";

const useStyles = makeStyles()((theme) => ({
  carousel: {
    borderRadius: theme.shape.borderRadius,
  },

  item: {
    height: theme.spacing(24),
    width: "100%",
    boxShadow:
      "0 1px 3px rgb(219 226 239 / 50%), 0 1px 2px rgb(219 226 239 / 50%)",
    textAlign: "left",
    position: "relative",
    overflow: "hidden",

    [theme.breakpoints.down("sm")]: {
      height: theme.spacing(26),
    },
  },

  mask: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)",
    opacity: 0.55,
  },

  chip: {
    position: "absolute",
    top: theme.spacing(2),
    left: theme.spacing(2),
    zIndex: 2,
  },

  textArea: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    maxWidth: "80%",
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1, 1, 1, 0.5),
    zIndex: 2,
  },

  detailButton: {
    marginTop: theme.spacing(1.5),
    color: "#fff",
    borderColor: "rgba(255,255,255,.55)",
    background: "rgba(0,0,0,.18)",
    backdropFilter: "blur(10px)",
    borderRadius: theme.spacing(1.2),
    padding: theme.spacing(0.8, 2.2),
    fontWeight: 600,
    fontSize: "0.875rem",
    textTransform: "none",

    "&:hover": {
      background: "rgba(255,255,255,.18)",
      borderColor: "rgba(255,255,255,.8)",
      transform: "translateY(-2px)",
    },

    transition: "all .25s ease",

    [theme.breakpoints.down("sm")]: {
      marginTop: theme.spacing(1),
      padding: theme.spacing(0.55, 1.5),
      fontSize: "0.75rem",
    },
  },

  dialogTitle: {
    fontWeight: "bold",
    fontSize: "1.5rem",
    paddingRight: theme.spacing(5),

    [theme.breakpoints.down("sm")]: {
      fontSize: "1.2rem",
      lineHeight: 1.4,
    },
  },
}));

const NoticeBlock: React.FC<{ notice: Notice }> = ({ notice }) => {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();
  const { classes } = useStyles();

  // 用 useCallback 稳定函数引用，避免子组件不必要重渲染
  const handleOpen = useCallback(() => {
    setOpen(true);
    ReactGA.event("click", {
      category: "notice",
      label: "notice_open",
      id: notice.id,
      title: notice.title,
    });
  }, [notice.id, notice.title]);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <Box
        component={ButtonBase}
        className={classes.item}
        sx={{
          backgroundImage: `url(${notice.img_url || defaultBackgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        onClick={handleOpen}
      >
        <Box className={classes.mask} />

        <Chip
          className={classes.chip}
          label={t("dashboard.announcement.chip")}
          color="secondary"
        />

        <Box className={classes.textArea}>
          <Typography
            variant="h4"
            mb={0.5}
            sx={{
              fontWeight: 700,
              textShadow: "0 2px 10px rgba(0,0,0,.25)",
            }}
          >
            {notice.title}
          </Typography>

          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            {dayjs.unix(notice.created_at).format("YYYY-MM-DD")}
          </Typography>

          {/*
            修复1：改用 t() 国际化，不再硬编码中文。
            修复2：移除 stopPropagation + 重复的 setOpen(true)。
                   父级 ButtonBase 已经处理点击打开 Dialog，
                   此按钮仅作视觉引导，行为由父级冒泡处理即可。
          */}
          <Button
            variant="outlined"
            size="small"
            className={classes.detailButton}
          >
            {t("dashboard.announcement.detail")} →
          </Button>
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            mx: 2,
            width: "calc(100% - 32px)",
            borderRadius: 3,
          },
        }}
      >
        <Box sx={{ position: "relative" }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 10,
              top: 10,
              color: "#999",
              zIndex: 2,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          <MuiDialogTitle className={classes.dialogTitle}>
            {notice.title}
          </MuiDialogTitle>

          <DialogContent
            sx={{
              minHeight: 160,
              overflowY: "auto",
              wordBreak: "break-word",
              fontSize: {
                xs: "0.95rem",
                sm: "1rem",
              },
              lineHeight: 1.8,
            }}
          >
            <MuiMarkdown>{notice.content}</MuiMarkdown>
          </DialogContent>
        </Box>
      </Dialog>
    </>
  );
};

const NoticeCarousel: React.FC<{
  onLatestNotice?: (notice: Notice) => void;
}> = ({ onLatestNotice }) => {
  const { data: notices } = useGetNoticesQuery();
  const { classes } = useStyles();
  const theme = useTheme();

  /*
    修复3：用 ref 保存最新的 onLatestNotice，让 useEffect 的依赖数组
    只依赖 notices，避免父组件每次渲染传入新函数引用时无限触发 effect。
  */
  const onLatestNoticeRef = useRef(onLatestNotice);
  useEffect(() => {
    onLatestNoticeRef.current = onLatestNotice;
  }, [onLatestNotice]);

  useEffect(() => {
    if (!notices || notices.length === 0) return;

    const latestNotice = notices.reduce((prev, current) =>
      dayjs.unix(current.created_at).isAfter(dayjs.unix(prev.created_at))
        ? current
        : prev
    );

    onLatestNoticeRef.current?.(latestNotice);
  }, [notices]);

  const isMobileSize = useMediaQuery(theme.breakpoints.down("sm"));

  // 修复4：空数据时提前返回，避免渲染空壳 Carousel
  if (!notices || notices.length === 0) return null;

  return (
    <Carousel
      autoPlay
      swipe={isMobileSize}
      stopAutoPlayOnHover
      interval={5000}
      animation="slide"
      duration={500}
      fullHeightHover={false}
      navButtonsAlwaysInvisible={isMobileSize}
      className={classes.carousel}
    >
      {/*
        修复5：key 移到 map 直接返回的元素 <NoticeBlock> 上。
        原来 key 写在 NoticeBlock 内部的 Box 上，React 无法用它做
        列表 diff，相当于没有 key。
      */}
      {notices.map((notice) => (
        <NoticeBlock key={notice.id} notice={notice} />
      ))}
    </Carousel>
  );
};

export default NoticeCarousel;
