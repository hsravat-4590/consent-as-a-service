<script lang="ts">
  import Button from "@smui/button";
  import Card from "@smui/card";

  let token: string = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlVmSTdUcmhpU1JZdDlfWVI4ZmRWOSJ9.eyJpc3MiOiJodHRwczovL2Rldi1vaXhrb28yNnk2Zm44c2JkLnVrLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwMDYzMzkwMzc4MTc3NzUxOTQ2NiIsImF1ZCI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDMiLCJodHRwczovL2Rldi1vaXhrb28yNnk2Zm44c2JkLnVrLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2ODI2MjU1NzMsImV4cCI6MTY4MjcxMTk3MywiYXpwIjoiMWNvRFpXWFdYcFV1QjBRaU9GUm91azhMbE5hb3hUcXoiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG9mZmxpbmVfYWNjZXNzIn0.l85ldYdX-h1ph_Hy7Lctm32k4dhr6LtkoIKdx-BNICBchP8puo0FuSE9i0kDwAZw5g1OoKPas7GLqwNNsCxFKkUyBk__1XUg1CJ54VnzIOJNS_0et8uouUanY-8CvDrC77i652Pve7YWnm5STKKH8EtUvVRJ1xuT5pBzzvU5IdCKhbc-fNLrkDhkMt4lyRpAwunhw7gKw0AyogcicPN5w0MgbvU1XRfi0s6Lz7mZ53kqXTtetWEqYtZVlIqFyJaygqFqVdhzm0aSiIE1tkh4e0saukuZaxJSTHcVllT-01UWYPc-eSoXz96JPhRTINh7FjfPy32FAV3UDVsZhGA3FA"
  let requestId: string = "744bfcd5-04ee-4a76-bbbf-82a4d91e834c"
  let pendingConsentId: string = localStorage.getItem('consentId')
  let url = localStorage.getItem('requestUrl')
  let pendingConsent: any;
  let consentData: any
  const createPendingConsent = async () =>  {
    const response = await fetch(`http://localhost:3003/consent/new/v1/${requestId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const json = await response.json();
    pendingConsent = json
    pendingConsentId = pendingConsent.consentId
    localStorage.setItem('consentId', pendingConsentId)
    localStorage.setItem('requestUrl', pendingConsent.request_url)
    console.log(JSON.stringify(json))
  }

  const getUrl = () => {
    if(pendingConsent && pendingConsent.request_url) {
      return pendingConsent.request_url;
    } else {
      return ""
    }
  }

  const getStatus = async () => {
    const response = await fetch(`http://localhost:3003/consent/state/v1/${pendingConsentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const json = await response.json();
    console.log(json)
    consentData = JSON.stringify(json)
  }

  const getConsentData = async () => {
    const response = await fetch(`http://localhost:3003/consent/data/v1/${pendingConsentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const json = await response.json();
    console.log(json)
    consentData = JSON.stringify(json)
  }

  const goToConsentRequest = () => {
    window.location.href= pendingConsent.request_url
  }
</script>

<main>
  <h1>Consent As A Service Demo</h1>

  <Card>
    <h2>Access Token</h2>
    <input bind:value={token}>
  </Card>

  <Card>
    <h2>Consent Request ID</h2>
    <input bind:value={requestId}>
  </Card>

<!--  <div class="card">-->
<!--    <h2>Access Token</h2>-->
<!--    <input bind:value={token}>-->
<!--  </div>-->
  <h3> </h3>
  <Button on:click= {() => createPendingConsent()}>
    Create Pending Consent
  </Button>

  <h2>Consent ID {pendingConsentId}</h2>

  <p>Make Request <a href={getUrl()}/></p>


  <Button on:click= {() => getStatus()}>
    Get Status
  </Button>
  <Button on:click= {() => goToConsentRequest()}>
    Go to Consent Request
  </Button>

  <Button on:click= {() => getConsentData()}>
    Get Data
  </Button>

  <p>{consentData}</p>
</main>

