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
import { UserConsentReadNetworkResponse } from "@consent-as-a-service/domain";
import Typography from "@mui/material/Typography";
import { Card, CardMedia } from "@mui/material";
import Container from "@mui/material/Container";
import ConsentRequestForm from "../../components/ConsentRequestForm";

const ConsentRequest = ({
  resultCode,
  resultMsg,
  consentRequest,
}: {
  resultCode: number;
  resultMsg: string;
  consentRequest: UserConsentReadNetworkResponse;
}) => {
  const router = useRouter();
  const { id } = router.query;
  if (resultCode !== 200) {
    return (
      <>
        <Typography variant="h5">Error</Typography>
        <Typography variant="h6">{resultCode}</Typography>
        <Typography variant="h6">{resultMsg}</Typography>
      </>
    );
  }
  let banner = "";
  if (consentRequest.requester.banner) {
    banner = consentRequest.requester.banner;
  }
  return (
    <>
      <Card>
        <CardMedia sx={{ height: 200 }} title="Banner" image={banner} />
        <Container
          sx={{
            m: 2.5,
          }}
        >
          <Typography variant="h5">
            {consentRequest.requester.displayName} requests your consent for:
          </Typography>
          <Typography variant="h2">{consentRequest.ui.title}</Typography>
          <Typography variant="h6">{consentRequest.ui.description}</Typography>
          <ConsentRequestForm id="form" schema={consentRequest.dataSchema} />
        </Container>
      </Card>
    </>
  );
};

export default ConsentRequest;
export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { accessToken } = await getAccessToken(ctx.req, ctx.res);
    console.log(`Query is ${JSON.stringify(ctx.query)}`);
    const response = await fetch(
      `${ServerConfig.baseUrl}:${ServerConfig.port}/consent/user/v1/${ctx.query.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
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