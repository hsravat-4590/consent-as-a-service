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

import { useRouter } from "next/router";
import { getAccessToken, withPageAuthRequired } from "@auth0/nextjs-auth0";
import ServerConfig from "../api/service/server.config";
import {
  ConsentCompleteNetworkModel,
  DataSubmission,
  UserConsentReadNetworkResponse,
} from "@consent-as-a-service/domain";
import Typography from "@mui/material/Typography";
import {
  Card,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import Container from "@mui/material/Container";
import ConsentRequestForm from "../../components/ConsentRequestForm";
import { useState } from "react";
import Box from "@mui/material/Box";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { nativeJs } from "@js-joda/core";

const ConsentRequest = ({
  resultCode,
  resultMsg,
  consentRequest,
}: {
  resultCode: number;
  resultMsg: string;
  consentRequest: UserConsentReadNetworkResponse;
}) => {
  console.log(`Request Expiry in String is ${consentRequest.expiry}`);
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expiry, setExpiry] = useState<Dayjs>(dayjs(consentRequest.expiry));

  const { id } = router.query;
  let banner = "";
  if (consentRequest.requester.banner) {
    banner = consentRequest.requester.banner;
  }
  const handleDialogClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    setDialogOpen(false);
  };
  const onRejectCalled = async () => {
    setDialogOpen(true);
    const response = await fetch(`/api/consent/reject/${consentRequest.id}`, {
      method: "POST",
    });
    if (response.status === 201) {
      const result = (await response.json()) as ConsentCompleteNetworkModel;
      window.location.replace(result.callbackUrl);
    } else {
      router.push("/request/error");
    }
  };

  const onSubmitCalled = async (data: any) => {
    setDialogOpen(true);
    const response = await fetch(`/api/consent/submit/${consentRequest.id}`, {
      method: "POST",
      body: JSON.stringify({
        consentRequestId: consentRequest.consentRequestId,
        submitData: data,
        expiry: nativeJs(expiry.toDate()).toLocalDateTime().toString(),
      } as DataSubmission),
    });
    if (response.status === 201) {
      const result = (await response.json()) as ConsentCompleteNetworkModel;
      window.location.replace(result.callbackUrl);
    } else {
      router.push("/request/error");
    }
  };
  return (
    <>
      <Card sx={{ m: 2 }}>
        <CardMedia sx={{ height: 200 }} title="Banner" image={banner} />
        <Container
          sx={{
            p: 1.5,
            m: 2.5,
          }}
        >
          <Typography variant="h5">
            {consentRequest.requester.displayName} requests your consent for:
          </Typography>
          <Typography variant="h2">{consentRequest.ui.title}</Typography>
          <Typography variant="h6">{consentRequest.ui.description}</Typography>
          <Box sx={{ m: 2 }}>
            <DateTimePicker
              label="Expiry"
              value={expiry}
              onChange={(newValue) => {
                setExpiry(newValue as Dayjs);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
          <ConsentRequestForm
            schema={consentRequest.dataSchema}
            onSubmit={onSubmitCalled}
            onRejected={onRejectCalled}
          />
        </Container>
      </Card>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Completing Request"}
        </DialogTitle>
        <DialogContent>
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConsentRequest;
export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx): Promise<GetSSPType> {
    const { accessToken } = await getAccessToken(ctx.req, ctx.res);
    const response = await fetch(
      `${ServerConfig.baseUrl}:${ServerConfig.port}/consent/user/v1/request/${ctx.query.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(
      `Response ${response.status} and Message ${response.statusText}`
    );
    if (response.status !== 200) {
      return {
        redirect: {
          permanent: true,
          destination: "/request/error",
        },
      };
    }
    const result = (await response.json()) as UserConsentReadNetworkResponse;
    return {
      props: {
        resultCode: response.status,
        resultMsg: response.statusText,
        consentRequest: result,
      },
    };
  },
});

export type GetSSPType =
  | {
      props: {
        resultCode: number;
        resultMsg: string;
        consentRequest: UserConsentReadNetworkResponse;
      };
    }
  | {
      redirect: {
        permanent: boolean;
        destination: string;
      };
    };
