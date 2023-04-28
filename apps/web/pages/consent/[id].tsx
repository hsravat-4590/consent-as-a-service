/*
 * Copyright (c) 2023 Hanzalah Ravat
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { getAccessToken, withPageAuthRequired } from "@auth0/nextjs-auth0";
import ServerConfig from "../api/service/server.config";
import { UserReadConsentNetworkModelWithStatus } from "@consent-as-a-service/domain";
import { useState } from "react";
import Typography from "@mui/material/Typography";
import {
  Alert,
  Box,
  Card,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Snackbar,
  SnackbarOrigin,
} from "@mui/material";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import dynamic from "next/dynamic";

const ConsentViewPage = ({
  resultCode,
  resultMsg,
  readModel,
}: {
  resultCode: number;
  resultMsg: string;
  readModel: UserReadConsentNetworkModelWithStatus;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSpinnerShowing, setDialogSpinner] = useState(false);
  const [dialogActionEnabled, setDialogActionEnabled] = useState(true);
  const [consentVoided, setConsentVoided] = useState(
    readModel.status === "VOIDED"
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarOrigin, setSnackbarOrigin] = useState<SnackbarOrigin>({
    vertical: "top",
    horizontal: "center",
  });
  const { vertical, horizontal } = snackbarOrigin;
  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
  const handleDialogClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    setDialogOpen(false);
  };

  const handleConsentVoid = async () => {
    setDialogActionEnabled(false);
    setDialogSpinner(true);
    const response = await fetch(`/api/consent/void/${readModel.consentId}`);
    if (response.status === 200) {
      setDialogOpen(false);
      setConsentVoided(true);
    } else {
      setDialogOpen(false);
      setDialogSpinner(false);
      setDialogActionEnabled(true);
      setSnackbarOpen(true);
    }
  };

  console.log(`Data is ${JSON.stringify(readModel.consentData)}`);
  return (
    <>
      <Box
        sx={{
          m: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h2">Manage Consent</Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            my: 2,
            gridTemplateColumns: "repeat(2,1fr)",
          }}
        >
          <Card>
            {readModel.org.banner && (
              <CardMedia
                sx={{ height: 200 }}
                title="Banner"
                image={readModel.org.banner}
              />
            )}
            <Container
              sx={{
                p: 2,
              }}
            >
              <Typography variant="h4">{readModel.title}</Typography>
              <Typography variant="h6">{readModel.description}</Typography>
              <Typography variant="subtitle1">
                This consent has been requested by: {readModel.org.displayName}
              </Typography>
              {consentVoided && (
                <Typography variant="subtitle1" color="error.main">
                  THIS CONSENT HAS BEEN VOIDED
                </Typography>
              )}
            </Container>
          </Card>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Data Stored By This Consent</Typography>
            {readModel.consentData ? (
              <DynamicReactJson consentData={readModel.consentData} />
            ) : (
              <Typography variant="body2"> No Data Found </Typography>
            )}
          </Card>
        </Box>
        <Grid container justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            color="error"
            disableElevation
            disabled={consentVoided}
            onClick={() => setDialogOpen(true)}
          >
            VOID Consent
          </Button>
        </Grid>
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Void Consent</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to void this consent?
          </DialogContentText>
        </DialogContent>
        {dialogSpinnerShowing && (
          <DialogContent>
            <Box textAlign="center">
              <CircularProgress />
              <DialogContentText>Please Wait...</DialogContentText>
            </Box>
          </DialogContent>
        )}
        <DialogActions>
          <Button disabled={!dialogActionEnabled} onClick={handleDialogClose}>
            Disagree
          </Button>
          <Button
            disabled={!dialogActionEnabled}
            onClick={handleConsentVoid}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        autoHideDuration={4000}
        anchorOrigin={{ vertical, horizontal }}
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        key={vertical + horizontal}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{
            width: "100%",
            color: "error.light",
            bgcolor: "error.main",
          }}
        >
          Error: Unable to Void Consent
        </Alert>
      </Snackbar>
    </>
  );
};

const DynamicReactJson = dynamic(
  () =>
    import("../../components/ReactJsonConsentData").then(
      (it) => it.ReactJsonConsentData
    ),
  { ssr: false }
);
export default ConsentViewPage;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { accessToken } = await getAccessToken(ctx.req, ctx.res);
    const response = await fetch(
      `${ServerConfig.baseUrl}:${ServerConfig.port}/consent/user/v1/${ctx.query.id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (response.status !== 200) {
      return {
        redirect: {
          permanent: true,
          destination: "/request/error", //TODO Proper Redirect
        },
      };
    }
    const result =
      (await response.json()) as UserReadConsentNetworkModelWithStatus;
    return {
      props: {
        resultCode: response.status,
        resultMsg: response.statusText,
        readModel: result,
      },
    };
  },
});
