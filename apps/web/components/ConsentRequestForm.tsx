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

import { DataSchema } from "@consent-as-a-service/domain";
import Container from "@mui/material/Container";
import {
  Alert,
  Card,
  Dialog,
  DialogActions,
  DialogTitle,
  Snackbar,
  SnackbarOrigin,
} from "@mui/material";
import Box from "@mui/material/Box";
import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { useState } from "react";
import Button from "@mui/material/Button";

interface ConsentRequestFormProps {
  schema: DataSchema;
  onSubmit: (submitData: any) => Promise<void> | void;
  onRejected: () => Promise<void> | void;
}

const ConsentRequestForm = ({
  schema,
  onSubmit,
  onRejected,
}: ConsentRequestFormProps) => {
  const [data, setData] = useState(schema.data);
  const [errors, setErrors] = useState<boolean>();
  const [dialogOpen, setDialogOpen] = useState(false);
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
  return (
    <Card
      elevation={0}
      sx={{
        color: "background.paper",
        p: 1,
      }}
    >
      <Container>
        <JsonForms
          schema={schema.schema}
          uischema={schema.uiSchema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data, errors }) => {
            setData(data);
            // @ts-ignore
            setErrors(errors.length !== 0);
          }}
          validationMode={"ValidateAndShow"}
        />
        <Box textAlign="center">
          <Button
            variant="contained"
            disableElevation
            size="large"
            sx={{
              m: 2.5,
            }}
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            disableElevation
            size="large"
            sx={{
              m: 2.5,
            }}
            onClick={() => {
              if (!errors) {
                onSubmit(data);
              } else {
                setSnackbarOpen(true);
              }
            }}
          >
            Submit
          </Button>
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
              Form Incomplete. Complete required fields before submitting
            </Alert>
          </Snackbar>
          <Dialog
            open={dialogOpen}
            onClose={handleDialogClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Are you sure you want to reject this consent?"}
            </DialogTitle>
            <DialogActions>
              <Button onClick={handleDialogClose}>No</Button>
              <Button
                onClick={(event) => {
                  handleDialogClose(event);
                  onRejected();
                }}
                autoFocus
              >
                Yes
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </Card>
  );
};

export default ConsentRequestForm;
