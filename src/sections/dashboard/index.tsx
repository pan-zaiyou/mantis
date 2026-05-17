import React, { useState, useEffect } from "react";
import {
  Grid,
  Dialog,
  DialogContent,
  Box,
  DialogTitle as MuiDialogTitle,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// project imports
import NoticeCarousel from "@/sections/dashboard/noticeCarousel";
import SubscriptionCard from "@/sections/dashboard/subscriptionCard";
import ShortcutCard from "@/sections/dashboard/shortcutCard";
import OrderPendingAlert from "@/sections/dashboard/alerts/orderPendingAlert";
import MuiMarkdown from "mui-markdown";
import { makeStyles } from "@/themes/hooks";
import Notice from "@/model/notice";

const useStyles = makeStyles()((theme) => ({
  dialogTitle: {
    fontWeight: "bold",
    fontSize: "1.5rem",
    paddingRight: theme.spacing(5),
  },
}));

const Dashboard: React.FC = () => {
  const [latestNotice, setLatestNotice] = useState<Notice | null>(null);
  const { classes } = useStyles();

  useEffect(() => {
    const hasClosedNotice = localStorage.getItem("hasClosedNotice");
    if (hasClosedNotice) {
      setLatestNotice(null);
    }
  }, []);

  const handleCloseDialog = () => {
    setLatestNotice(null);
    localStorage.setItem("hasClosedNotice", "true");
  };

  const handleLatestNotice = (notice: Notice | null) => {
    const hasClosedNotice = localStorage.getItem("hasClosedNotice");
    if (!hasClosedNotice) {
      setLatestNotice(notice);
    }
  };

  return (
    <Grid
      container
      rowSpacing={2}
      columnSpacing={{
        xs: 1,
        md: 2,
      }}
    >
      <Grid item xs={12}>
        <OrderPendingAlert />
      </Grid>

      <Grid item xs={12}>
        <NoticeCarousel onLatestNotice={handleLatestNotice} />
        <SubscriptionCard />
      </Grid>

      <Grid item xs={12}>
        <ShortcutCard />
      </Grid>

      {latestNotice && (
        <Dialog
          open={Boolean(latestNotice)}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              mx: 2,
              width: "calc(100% - 32px)",
            },
          }}
        >
          <Box sx={{ position: "relative" }}>
            <IconButton
              onClick={handleCloseDialog}
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
              {latestNotice.title}
            </MuiDialogTitle>

            <DialogContent
              sx={{
                minHeight: 160,
                overflowY: "auto",
                wordBreak: "break-word",
              }}
            >
              <MuiMarkdown>{latestNotice.content}</MuiMarkdown>
            </DialogContent>
          </Box>
        </Dialog>
      )}
    </Grid>
  );
};

export default Dashboard;
